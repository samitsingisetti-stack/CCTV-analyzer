import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, Activity, AlertTriangle, Users } from 'lucide-react';

export default function Dashboard() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/videos`)
      .then(res => res.json())
      .then(data => {
        setVideos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">Command Center</h1>
        <p className="text-muted-foreground mt-2">Overview of all surveillance streams and AI insights.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Active Streams" value={videos.length.toString()} icon={Video} color="text-blue-500" />
        <MetricCard title="Total Detections" value="-" icon={Users} color="text-green-500" />
        <MetricCard title="High Alerts" value="-" icon={AlertTriangle} color="text-red-500" />
        <MetricCard title="Processing" value={videos.filter(v => v.status === 'processing').length.toString()} icon={Activity} color="text-purple-500" />
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Footages</h2>
        {loading ? (
          <div className="h-32 flex items-center justify-center text-muted-foreground">Loading videos...</div>
        ) : videos.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-muted-foreground">
            <p>No videos uploaded yet.</p>
            <Link to="/upload" className="text-blue-400 hover:text-blue-300 mt-2">Upload your first video</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-white/5">
                <tr>
                  <th className="px-6 py-3 rounded-tl-lg">Title</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Context</th>
                  <th className="px-6 py-3 rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <tr key={video.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center">
                        <Video size={18} className="text-blue-400" />
                      </div>
                      {video.title}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={video.status} />
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{video.context_type || 'General'}</td>
                    <td className="px-6 py-4">
                      {video.status === 'completed' && (
                        <Link to={`/analysis/${video.id}`} className="text-blue-400 hover:text-blue-300 font-medium">
                          View Analysis &rarr;
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) {
  return (
    <div className="glass-card p-6 flex items-start justify-between group cursor-pointer hover:-translate-y-1">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-3xl font-bold mt-2">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg bg-white/5 ${color} group-hover:bg-white/10 transition-colors`}>
        <Icon size={24} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: 'bg-green-500/10 text-green-500 border border-green-500/20',
    processing: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
    uploading: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    failed: 'bg-red-500/10 text-red-500 border border-red-500/20',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-500/10 text-gray-400'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
