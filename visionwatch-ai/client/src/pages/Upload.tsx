import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileVideo, AlertCircle, Loader2 } from 'lucide-react';

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [contextType, setContextType] = useState('General Surveillance');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError('');
    if (!selectedFile.type.startsWith('video/')) {
      setError('Please upload a valid video file (.mp4, .mov, .avi)');
      return;
    }
    if (selectedFile.size > 500 * 1024 * 1024) {
      setError('File size must be less than 500MB');
      return;
    }
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('video', file);
    formData.append('contextType', contextType);

    try {
      const uploadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/videos/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const { video, geminiFileUri } = await uploadRes.json();
      
      setUploading(false);
      setAnalyzing(true);

      // Trigger Analysis asynchronously (in background) or await it
      // Since it might take a while, we'll await it but show analyzing state
      const analyzeRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/videos/${video.id}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminiFileUri })
      });

      if (!analyzeRes.ok) {
        throw new Error('Analysis failed');
      }

      navigate(`/analysis/${video.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred');
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 animate-in zoom-in-95 duration-500">
      <div className="glass-card p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <UploadIcon size={32} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold">Upload Surveillance Footage</h1>
          <p className="text-muted-foreground mt-2">Upload your CCTV video for AI-powered analysis.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
              file ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex flex-col items-center gap-3">
                <FileVideo size={48} className="text-blue-400" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <button type="button" onClick={() => setFile(null)} className="text-sm text-red-400 hover:text-red-300 mt-2">
                  Remove File
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <UploadIcon size={48} className="text-muted-foreground" />
                <p className="text-muted-foreground">Drag and drop your video file here, or</p>
                <label className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg cursor-pointer transition-colors font-medium">
                  Browse Files
                  <input
                    type="file"
                    className="hidden"
                    accept="video/mp4,video/x-m4v,video/*"
                    onChange={(e) => e.target.files && validateAndSetFile(e.target.files[0])}
                  />
                </label>
                <p className="text-xs text-muted-foreground mt-2">Max 500MB. MP4, MOV, AVI formats supported.</p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-400">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Environment Context</label>
            <select
              value={contextType}
              onChange={(e) => setContextType(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors"
            >
              <option className="bg-background">General Surveillance</option>
              <option className="bg-background">Retail Store Front</option>
              <option className="bg-background">Restricted Server Room</option>
              <option className="bg-background">Parking Lot</option>
              <option className="bg-background">Office Lobby</option>
            </select>
            <p className="text-xs text-muted-foreground">Helps the AI tune its anomaly detection rules.</p>
          </div>

          <button
            type="submit"
            disabled={!file || uploading || analyzing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <><Loader2 className="animate-spin" size={20} /> Uploading Video...</>
            ) : analyzing ? (
              <><Loader2 className="animate-spin" size={20} /> Analyzing with Gemini 1.5 Pro...</>
            ) : (
              'Start Analysis'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
