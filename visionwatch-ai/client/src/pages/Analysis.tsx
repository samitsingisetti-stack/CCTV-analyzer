import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Video, AlertTriangle, Play, Pause } from 'lucide-react';

export default function Analysis() {
  const { videoId } = useParams();
  const [video, setVideo] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [videoRes, eventsRes, analyticsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/videos`),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/videos/${videoId}/timeline`),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/videos/${videoId}/analytics`)
        ]);
        
        const videos = await videoRes.json();
        const v = videos.find((v: any) => v.id === videoId);
        setVideo(v);
        
        const evts = await eventsRes.json();
        setEvents(evts);
        
        const analytics = await analyticsRes.json();
        setStats(analytics);
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [videoId]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const jumpTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center">Loading analysis...</div>;
  }

  if (!video) {
    return <div className="text-center mt-20 text-red-400">Video not found.</div>;
  }

  const highSeverityEvents = events.filter(e => e.severity === 'High');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Video className="text-blue-500" />
            {video.title}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Context: {video.context_type}</p>
        </div>
      </header>

      {highSeverityEvents.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-4">
          <AlertTriangle className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-500 font-semibold">High Severity Anomalies Detected</h3>
            <p className="text-red-400/80 text-sm mt-1">{highSeverityEvents.length} critical events require your immediate attention.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Video Player */}
        <div className="lg:col-span-2 glass-card overflow-hidden flex flex-col">
          <div className="relative flex-1 bg-black group">
            <video
              ref={videoRef}
              src={video.publicUrl}
              className="w-full h-full object-contain"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            {/* Custom Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-4">
              <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
            </div>
          </div>
          
          {stats && (
            <div className="p-4 bg-white/5 border-t border-white/10 flex justify-around">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Total People</p>
                <p className="font-bold text-lg">{stats.total_people_detected}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Peak Occupancy</p>
                <p className="font-bold text-lg">{stats.peak_occupancy}</p>
              </div>
            </div>
          )}
        </div>

        {/* Event Timeline Sidebar */}
        <div className="glass-card flex flex-col">
          <div className="p-4 border-b border-white/10 font-semibold flex justify-between items-center">
            Event Timeline
            <span className="text-xs bg-white/10 px-2 py-1 rounded-full">{events.length} events</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {events.map((event, idx) => (
              <div 
                key={event.id || idx}
                onClick={() => jumpTo(event.timestamp_start)}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:-translate-y-0.5 ${
                  event.severity === 'High' ? 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10' :
                  event.severity === 'Medium' ? 'border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10' :
                  'border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-mono bg-black/30 px-1.5 rounded text-muted-foreground">
                    {new Date(event.timestamp_start * 1000).toISOString().substr(14, 5)}
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 rounded ${
                    event.severity === 'High' ? 'text-red-400' :
                    event.severity === 'Medium' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`}>
                    {event.severity}
                  </span>
                </div>
                <h4 className="font-medium text-sm">{event.event_type}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
