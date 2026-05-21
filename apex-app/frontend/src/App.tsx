import { HashRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ArchitecturePage from './pages/ArchitecturePage';
import PipelinePage from './pages/PipelinePage';
import TicketingPage from './pages/TicketingPage';
import StreamingPage from './pages/StreamingPage';
import PlayerPerfPage from './pages/PlayerPerfPage';
import SponsorshipPage from './pages/SponsorshipPage';
import IntegrityPage from './pages/IntegrityPage';
import PolicyPage from './pages/PolicyPage';
import NotFoundPage from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="/ticketing" element={<TicketingPage />} />
            <Route path="/streaming" element={<StreamingPage />} />
            <Route path="/players" element={<PlayerPerfPage />} />
            <Route path="/sponsorship" element={<SponsorshipPage />} />
            <Route path="/integrity" element={<IntegrityPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/policy" element={<PolicyPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  );
}
