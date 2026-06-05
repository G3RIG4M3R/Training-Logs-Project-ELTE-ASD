import { useState } from 'react';
import Navbar from './components/Navbar';
import AthletesPage from './pages/AthletesPage';
import AttendancePage from './pages/AttendancePage';
import ResultsPage from './pages/ResultsPage';
import ProfilePage from './pages/ProfilePage';
import type { Athlete } from './types/athlete';

type Page = 'athletes' | 'attendance' | 'results';

export default function App() {
  const [page, setPage] = useState<Page>('athletes');
  const [selectedAthleteId, setSelectedAthleteId] = useState<number | null>(null);

  const handleNavigate = (p: string) => {
    setSelectedAthleteId(null);
    setPage(p as Page);
  };

  const handleViewProfile = (athlete: Athlete) => {
    setSelectedAthleteId(athlete.id);
  };

  return (
    <>
      <Navbar currentPage={selectedAthleteId !== null ? '' : page} onNavigate={handleNavigate} />
      <main className="main">
        {selectedAthleteId !== null ? (
          <ProfilePage
            athleteId={selectedAthleteId}
            onBack={() => setSelectedAthleteId(null)}
          />
        ) : (
          <>
            {page === 'athletes'   && <AthletesPage onViewProfile={handleViewProfile} />}
            {page === 'attendance' && <AttendancePage />}
            {page === 'results'    && <ResultsPage />}
          </>
        )}
      </main>
    </>
  );
}
