import { AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Shell } from './components/Shell';
import { PageTransition } from './components/PageTransition';
import { Landing } from './pages/Landing';
import { Ecosystem } from './pages/Ecosystem';
import { ZonePage } from './pages/ZonePage';
import { Participate } from './pages/Participate';
import { Programs } from './pages/Programs';
import { Journey } from './pages/Journey';
import { Pharos } from './pages/Pharos';
import { Faq } from './pages/Faq';
import { Sandbox } from './pages/Sandbox';
import { CuratorStudio } from './pages/CuratorStudio';
import { Tracker } from './pages/Tracker';
import { Pulse } from './pages/Pulse';

const wrap = (el: React.ReactNode) => <PageTransition>{el}</PageTransition>;

export default function App() {
  const location = useLocation();
  return (
    <Shell>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={wrap(<Landing />)} />
          <Route path="/ecosystem" element={wrap(<Ecosystem />)} />
          <Route path="/zone/:id" element={wrap(<ZonePage />)} />
          <Route path="/participate" element={wrap(<Participate />)} />
          <Route path="/programs" element={wrap(<Programs />)} />
          <Route path="/journey" element={wrap(<Journey />)} />
          <Route path="/sandbox" element={wrap(<Sandbox />)} />
          <Route path="/studio" element={wrap(<CuratorStudio />)} />
          <Route path="/tracker" element={wrap(<Tracker />)} />
          <Route path="/pulse" element={wrap(<Pulse />)} />
          <Route path="/pharos" element={wrap(<Pharos />)} />
          <Route path="/faq" element={wrap(<Faq />)} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Shell>
  );
}
