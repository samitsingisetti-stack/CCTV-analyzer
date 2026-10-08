import { useEffect, useState } from 'react';
import { Bell, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app we'd have a global /alerts endpoint.
    // For now we'll fetch all videos and their timelines, or just create a specific endpoint.
    // Since we don't have a global alerts endpoint, we will fetch all videos and filter the high events.
    const fetchAlerts = async () => {
      try {
        const videosRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/videos`);
        const videos = await videosRes.json();
        
        let allAlerts: any[] = [];
        
        for (const video of videos) {
          if (video.status === 'completed') {
             const eventsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/videos/${video.id}/timeline`);
             const events = await eventsRes.json();
             const highEvents = events.filter((e: any) => e.severity === 'High').map((e: any) => ({
                 ...e,
                 videoTitle: video.title
             }));
             allAlerts = [...allAlerts, ...highEvents];
          }
        }
        
        setAlerts(allAlerts.sort((a, b) => b.timestamp_start - a.timestamp_start));
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    
    fetchAlerts();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-3 text-red-500">
          <Bell className="text-red-500" />
          Global Alerts Center
        </h1>
        <p className="text-muted-foreground mt-2">High-priority anomaly notifications across all active streams.</p>
      </header>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-muted-foreground">Scanning for alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="glass-card p-12 text-center text-green-400 border border-green-500/20">
             <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
               <Bell size={32} />
             </div>
             <p className="font-semibold text-lg">All Clear</p>
             <p className="text-sm mt-1 opacity-80">No high severity anomalies detected in any stream.</p>
          </div>
        ) : (
          alerts.map((alert, idx) => (
            <div key={idx} className="glass-card p-4 border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-colors flex items-start gap-4">
              <AlertTriangle className="text-red-500 mt-1 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                   <h3 className="text-red-400 font-bold">{alert.event_type}</h3>
                   <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded font-mono">
                     {new Date(alert.timestamp_start * 1000).toISOString().substr(14, 5)}
                   </span>
                </div>
                <p className="text-muted-foreground text-sm mt-1">{alert.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                   <span className="text-muted-foreground/60">Source: <span className="text-foreground">{alert.videoTitle}</span></span>
                   <Link to={`/analysis/${alert.video_id}`} className="text-blue-400 hover:text-blue-300 font-medium">Investigate &rarr;</Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
