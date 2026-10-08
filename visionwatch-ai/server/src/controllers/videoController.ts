import { Request, Response } from 'express';
import { supabase } from '../services/supabase';
import { uploadToGemini, analyzeVideoWithGemini, askGemini } from '../services/gemini';
import fs from 'fs';

export const uploadVideo = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file provided' });
        }

        const { path, originalname, mimetype } = req.file;
        const contextType = req.body.contextType || null;
        
        const timestamp = Date.now();
        const storagePath = `${timestamp}_${originalname}`;
        
        const fileContent = fs.readFileSync(path);

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('videos')
            .upload(storagePath, fileContent, {
                contentType: mimetype,
                upsert: false
            });

        if (uploadError) {
            fs.unlinkSync(path);
            throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
            .from('videos')
            .getPublicUrl(storagePath);

        // Upload to Gemini
        const geminiFile = await uploadToGemini(path, mimetype);

        // Insert to DB
        const { data: video, error: dbError } = await supabase
            .from('videos')
            .insert({
                title: originalname,
                storage_path: storagePath,
                status: 'uploading',
                context_type: contextType
            })
            .select()
            .single();

        if (dbError) throw dbError;

        fs.unlinkSync(path);
        
        // Return gemini file URI so client can trigger analyze
        res.status(200).json({ 
            video, 
            geminiFileUri: geminiFile.uri,
            publicUrl: publicUrlData.publicUrl 
        });

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const analyzeVideo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { geminiFileUri } = req.body;

        await supabase.from('videos').update({ status: 'processing' }).eq('id', id);

        const { data: video } = await supabase.from('videos').select('*').eq('id', id).single();
        
        if (!video) return res.status(404).json({ error: 'Video not found' });

        const analysis = await analyzeVideoWithGemini(geminiFileUri, video.context_type);

        // Insert Analysis Results
        await supabase.from('analysis_results').insert({
            video_id: id,
            total_people_detected: analysis.total_people,
            peak_occupancy: analysis.peak_occupancy,
            ai_summary: analysis.summary
        });

        // Insert Events
        const eventsToInsert = analysis.events.map((e: any) => ({
            video_id: id,
            timestamp_start: e.start_time,
            timestamp_end: e.end_time,
            event_type: e.event_type,
            description: e.description,
            severity: e.severity,
            is_anomaly: e.is_anomaly
        }));

        if (eventsToInsert.length > 0) {
            await supabase.from('detected_events').insert(eventsToInsert);
        }

        await supabase.from('videos').update({ status: 'completed' }).eq('id', id);

        res.status(200).json({ message: 'Analysis complete', analysis });

    } catch (error: any) {
        console.error(error);
        await supabase.from('videos').update({ status: 'failed' }).eq('id', req.params.id);
        res.status(500).json({ error: error.message });
    }
};

export const getTimeline = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { data: events, error } = await supabase
            .from('detected_events')
            .select('*')
            .eq('video_id', id)
            .order('timestamp_start', { ascending: true });

        if (error) throw error;
        res.status(200).json(events);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAnalytics = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { data: stats, error } = await supabase
            .from('analysis_results')
            .select('*')
            .eq('video_id', id)
            .single();

        if (error) throw error;
        res.status(200).json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const searchVideo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { query } = req.body;
        // In a real scenario we could use pgvector for semantic search,
        // but for now we'll do an ilike match on descriptions.
        const { data: events, error } = await supabase
            .from('detected_events')
            .select('*')
            .eq('video_id', id)
            .ilike('description', `%${query}%`);
            
        if (error) throw error;
        res.status(200).json(events);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const askVideo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { query, geminiFileUri } = req.body;
        
        const { data: events } = await supabase
            .from('detected_events')
            .select('*')
            .eq('video_id', id);
            
        const eventsSummary = JSON.stringify(events || []);

        const answer = await askGemini(geminiFileUri, query, eventsSummary);

        await supabase.from('ai_conversations').insert({
            video_id: id,
            query,
            response: answer.answer,
            referenced_timestamps: answer.relevant_timestamps
        });

        res.status(200).json(answer);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getReport = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { data: stats } = await supabase.from('analysis_results').select('*').eq('video_id', id).single();
        const { data: events } = await supabase.from('detected_events').select('*').eq('video_id', id).order('timestamp_start', { ascending: true });
        
        res.status(200).json({ stats, events });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getVideos = async (req: Request, res: Response) => {
    try {
        const { data: videos, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        
        const videosWithUrl = videos.map(v => ({
            ...v,
            publicUrl: supabase.storage.from('videos').getPublicUrl(v.storage_path).data.publicUrl
        }));

        res.status(200).json(videosWithUrl);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
