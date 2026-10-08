import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart2, Users, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Analytics() {
  const { videoId } = useParams();
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.VITE_API_BASE_URL}/videos/${videoId}/analytics`),
      fetch(`${import.meta.env.VITE_API_BASE_URL}/videos/${videoId}/timeline`)
    ])
      .then(([res1, res2]) => Promise.all([res1.json(), res2.json()]))
      .then(([data1, data2]) => {
        setStats(data1);
        setEvents(data2);
      })
      .catch(err => console.error(err));
  }, [videoId]);

  if (!stats) return <div className="text-center mt-20 text-muted-foreground">Loading analytics...</div>;

  // Process events for chart
  const activityDistribution = events.reduce((acc: any, event: any) => {
    acc[event.event_type] = (acc[event.event_type] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(activityDistribution).map(key => ({
    name: key,
    count: activityDistribution[key]
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart2 className="text-blue-500" />
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Deep dive into occupancy and activity data.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center">
            <Users size={32} className="text-blue-400" />
          </div>
          <div>
            <p className="text-muted-foreground font-medium">Total Unique People</p>
            <h2 className="text-4xl font-bold mt-1">{stats.total_people_detected}</h2>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center">
            <Activity size={32} className="text-purple-400" />
          </div>
          <div>
            <p className="text-muted-foreground font-medium">Peak Occupancy</p>
            <h2 className="text-4xl font-bold mt-1">{stats.peak_occupancy}</h2>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 mt-8">
        <h3 className="text-xl font-bold mb-6">Activity Distribution</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#ffffff50" />
              <YAxis stroke="#ffffff50" />
              <Tooltip 
                cursor={{fill: '#ffffff10'}}
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} 
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {stats.ai_summary && (
         <div className="glass-card p-6 mt-8 bg-blue-500/5 border-blue-500/20">
            <h3 className="text-xl font-bold mb-4 text-blue-400">AI Executive Summary</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{stats.ai_summary}</p>
         </div>
      )}
    </div>
  );
}
