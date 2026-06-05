import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AthletesPage from './pages/AthletesPage';
import AttendancePage from './pages/AttendancePage';
import ResultsPage from './pages/ResultsPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/athletes" replace />} />
          <Route path="/athletes" element={<AthletesPage />} />
          <Route path="/athletes/:athleteId" element={<ProfilePage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="*" element={<Navigate to="/athletes" replace />} />
        </Routes>
      </main>
    </>
  );
}
