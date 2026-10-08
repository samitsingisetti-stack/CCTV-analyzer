import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are VisionWatch AI, a highly objective, professional surveillance analysis engine. 
Your primary task is to analyze CCTV footage to extract factual, observable data.
RULES:
1. Report ONLY observable actions, movements, and counts.
2. NEVER guess intent, emotion, identity, or legal guilt. (e.g., say "Person picked up object and ran", NOT "Thief stole item").
3. Assign severity strictly based on physical anomalies (e.g., sudden running, entering restricted areas).
4. Provide precise video timestamps (in seconds) for every event.
5. Your output must strictly adhere to the requested JSON schema.`;

export async function uploadToGemini(filePath: string, mimeType: string) {
    try {
        const uploadResult = await ai.files.upload({ file: filePath, config: { mimeType } });
        console.log(`Uploaded file ${uploadResult.name} to Gemini`);
        
        // Wait until the file is active
        let fileState = await ai.files.get({ name: uploadResult.name! });
        while (fileState.state === 'PROCESSING') {
            console.log('Waiting for video processing...');
            await new Promise((resolve) => setTimeout(resolve, 10000));
            fileState = await ai.files.get({ name: uploadResult.name! });
        }
        
        if (fileState.state === 'FAILED') {
            throw new Error('Video processing failed.');
        }

        return uploadResult;
    } catch (error) {
        console.error("Gemini Upload Error", error);
        throw error;
    }
}

export async function analyzeVideoWithGemini(fileUri: string, contextType: string | null = null) {
    const prompt = `Analyze this CCTV footage from start to finish. Provide peak occupancy, total unique people observed, and a chronological array of key events and anomalies.${contextType ? ` Context: ${contextType}` : ''}`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-1.5-pro',
        contents: [
            {
                role: 'user',
                parts: [
                    { fileData: { fileUri, mimeType: 'video/mp4' } },
                    { text: prompt }
                ]
            }
        ],
        config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    total_people: { type: Type.INTEGER },
                    peak_occupancy: { type: Type.INTEGER },
                    summary: { type: Type.STRING },
                    events: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                start_time: { type: Type.NUMBER },
                                end_time: { type: Type.NUMBER },
                                event_type: { type: Type.STRING },
                                description: { type: Type.STRING },
                                severity: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                                is_anomaly: { type: Type.BOOLEAN }
                            }
                        }
                    }
                }
            }
        }
    });

    if (response.text) {
        return JSON.parse(response.text);
    }
    throw new Error('Failed to get analysis from Gemini');
}

export async function askGemini(fileUri: string, query: string, eventsSummary: string) {
    const prompt = `Using the provided video context and events summary, answer the user's query: '${query}'. Ground your answer entirely in the video. Provide timestamps for evidence. Events summary: ${eventsSummary}`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-1.5-pro',
        contents: [
            {
                role: 'user',
                parts: [
                    { fileData: { fileUri, mimeType: 'video/mp4' } },
                    { text: prompt }
                ]
            }
        ],
        config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    answer: { type: Type.STRING },
                    relevant_timestamps: {
                        type: Type.ARRAY,
                        items: { type: Type.NUMBER }
                    }
                }
            }
        }
    });

    if (response.text) {
        return JSON.parse(response.text);
    }
    throw new Error('Failed to get answer from Gemini');
}
