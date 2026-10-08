import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Filter, Play } from 'lucide-react';

export default function Timeline() {
  const { videoId } = useParams();
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/videos/${videoId}/timeline`)
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error(err));
  }, [videoId]);

  const filteredEvents = filter === 'All' ? events : events.filter(e => e.severity === filter);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="text-blue-500" />
            Chronological Timeline
          </h1>
          <p className="text-muted-foreground mt-2">All detected events sorted by timestamp.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-muted-foreground" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none"
          >
            <option value="All" className="bg-background">All Severities</option>
            <option value="High" className="bg-background">High Only</option>
            <option value="Medium" className="bg-background">Medium Only</option>
            <option value="Low" className="bg-background">Low Only</option>
          </select>
        </div>
      </header>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4">Event Type</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Severity</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event, idx) => (
              <tr key={event.id || idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-mono text-muted-foreground">
                  {new Date(event.timestamp_start * 1000).toISOString().substr(14, 5)} - 
                  {new Date(event.timestamp_end * 1000).toISOString().substr(14, 5)}
                </td>
                <td className="px-6 py-4 font-medium">{event.event_type}</td>
                <td className="px-6 py-4 text-muted-foreground max-w-md">{event.description}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                    event.severity === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    event.severity === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {event.severity}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    to={`/analysis/${videoId}`} 
                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Play size={14} /> Watch
                  </Link>
                </td>
              </tr>
            ))}
            {filteredEvents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
