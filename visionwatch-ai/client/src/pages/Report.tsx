import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function Report() {
  const { videoId } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/videos/${videoId}/report`)
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error(err));
  }, [videoId]);

  const handlePrint = () => {
    window.print();
  };

  if (!data) return <div className="text-center mt-20">Loading report...</div>;

  const { stats, events } = data;
  const highEvents = events.filter((e: any) => e.severity === 'High');

  return (
    <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-xl overflow-hidden shadow-2xl printable-area animate-in zoom-in-95 duration-500">
      {/* Non-printable header controls */}
      <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center print:hidden">
         <h2 className="font-semibold text-slate-700">Report Viewer</h2>
         <button onClick={handlePrint} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Download size={18} /> Export PDF
         </button>
      </div>

      <div className="p-12 space-y-8">
        <header className="border-b-2 border-slate-200 pb-6 flex justify-between items-end">
           <div>
             <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
               <ShieldCheck className="text-blue-600" size={40} />
               VisionWatch AI Report
             </h1>
             <p className="text-slate-500 mt-2">Automated Security Intelligence</p>
           </div>
           <div className="text-right text-sm text-slate-500">
             <p>Report ID: {videoId}</p>
             <p>Generated: {new Date().toLocaleDateString()}</p>
           </div>
        </header>

        <section>
          <h2 className="text-2xl font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Executive Summary</h2>
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{stats.ai_summary}</p>
        </section>

        <section className="grid grid-cols-2 gap-6">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
             <p className="text-slate-500 font-medium">Total People Observed</p>
             <p className="text-4xl font-bold text-slate-900 mt-2">{stats.total_people_detected}</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
             <p className="text-slate-500 font-medium">Peak Occupancy</p>
             <p className="text-4xl font-bold text-slate-900 mt-2">{stats.peak_occupancy}</p>
          </div>
        </section>

        {highEvents.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-red-600 mb-4 border-b border-red-200 pb-2 flex items-center gap-2">
              <AlertTriangle /> Critical Anomalies
            </h2>
            <div className="space-y-4">
              {highEvents.map((event: any, idx: number) => (
                <div key={idx} className="bg-red-50 p-4 rounded-lg border border-red-100">
                   <div className="flex justify-between font-bold text-red-900">
                     <span>{event.event_type}</span>
                     <span>{new Date(event.timestamp_start * 1000).toISOString().substr(14, 5)}</span>
                   </div>
                   <p className="text-red-800 mt-1 text-sm">{event.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-2xl font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Activity Log Summary</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-600">
                <th className="p-3 font-semibold">Time</th>
                <th className="p-3 font-semibold">Event</th>
                <th className="p-3 font-semibold">Severity</th>
              </tr>
            </thead>
            <tbody>
              {events.slice(0, 15).map((e: any, i: number) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="p-3 font-mono text-slate-500">{new Date(e.timestamp_start * 1000).toISOString().substr(14, 5)}</td>
                  <td className="p-3 text-slate-800">{e.event_type}</td>
                  <td className="p-3">
                     <span className={`px-2 py-1 rounded text-xs font-bold ${
                        e.severity === 'High' ? 'bg-red-100 text-red-700' :
                        e.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-700'
                     }`}>
                       {e.severity}
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {events.length > 15 && (
            <p className="text-center text-slate-400 text-sm mt-4 italic">Showing first 15 events. Full log available in dashboard.</p>
          )}
        </section>

        <footer className="pt-8 border-t border-slate-200 text-center text-slate-400 text-sm mt-12">
           <p>This report was automatically generated by VisionWatch AI. It contains objective observations based on visual data.</p>
        </footer>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
