import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Analysis from './pages/Analysis';
import Timeline from './pages/Timeline';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import AskAI from './pages/AskAI';
import Report from './pages/Report';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/analysis/:videoId" element={<Analysis />} />
          <Route path="/timeline/:videoId" element={<Timeline />} />
          <Route path="/analytics/:videoId" element={<Analytics />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/ask-ai/:videoId" element={<AskAI />} />
          <Route path="/reports/:videoId" element={<Report />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
