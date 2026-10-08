import { Link, useLocation } from 'react-router-dom';
import { Video, BarChart2, Bell, MessageSquare, FileText, Upload as UploadIcon, Home } from 'lucide-react';
import type { ReactNode } from 'react';

const Layout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Upload', path: '/upload', icon: UploadIcon },
    { name: 'Alerts', path: '/alerts', icon: Bell },
  ];

  const currentVideoId = location.pathname.split('/')[2];

  const videoNavItems = currentVideoId ? [
    { name: 'Analysis', path: `/analysis/${currentVideoId}`, icon: Video },
    { name: 'Timeline', path: `/timeline/${currentVideoId}`, icon: FileText },
    { name: 'Analytics', path: `/analytics/${currentVideoId}`, icon: BarChart2 },
    { name: 'Ask AI', path: `/ask-ai/${currentVideoId}`, icon: MessageSquare },
    { name: 'Reports', path: `/reports/${currentVideoId}`, icon: FileText },
  ] : [];

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <aside className="w-64 glass border-r border-white/10 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gradient flex items-center gap-2">
            <Video className="text-blue-500" /> VisionWatch AI
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Main Menu</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}

          {videoNavItems.length > 0 && (
            <>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-8 mb-2 px-2">Video Context</div>
              {videoNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-500/20 text-blue-400 font-medium' 
                        : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                    }`}
                  >
                    <Icon size={18} />
                    {item.name}
                  </Link>
                );
              })}
            </>
          )}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background pointer-events-none" />
        <div className="p-8 relative z-10 max-w-7xl mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
