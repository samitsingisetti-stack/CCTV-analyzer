import { Router } from 'express';
import multer from 'multer';
import {
  uploadVideo,
  analyzeVideo,
  getTimeline,
  getAnalytics,
  searchVideo,
  askVideo,
  getReport,
  getVideos
} from '../controllers/videoController';

const router = Router();

// Store files in memory temporarily before uploading to Supabase Storage,
// or we can just send signed URLs to client to upload directly.
// The requirements say: "POST /api/videos/upload - Secure URL generation for Supabase storage upload."
// Wait, the prompt says "The backend must first upload the video via the File API for Gemini processing".
// It also says: "System uploads file to Supabase Storage, shows preview, and passes file URI to Backend. Backend utilizes @google/genai to analyze the entire video using Gemini 1.5 Pro."
// So the frontend can upload to Supabase Storage directly, and then send the path to the backend?
// Let's create an endpoint that accepts a file upload, uploads to both Supabase storage and Gemini.
// Wait, the prompt says: "POST /api/videos/upload - Secure URL generation for Supabase storage upload."
// So the backend generates a signed URL? Or maybe we can just use Supabase client on frontend to upload, but requirements say POST /api/videos/upload.
// Let's implement it.

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('video'), uploadVideo);
router.post('/:id/analyze', analyzeVideo);
router.get('/:id/timeline', getTimeline);
router.get('/:id/analytics', getAnalytics);
router.post('/:id/search', searchVideo);
router.post('/:id/ask', askVideo);
router.get('/:id/report', getReport);
router.get('/', getVideos);

export default router;
