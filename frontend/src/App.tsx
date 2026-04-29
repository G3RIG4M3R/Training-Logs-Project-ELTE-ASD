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
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);

  const handleNavigate = (p: string) => {
    setSelectedAthlete(null);
    setPage(p as Page);
  };

  return (
    <>
      <Navbar currentPage={page} onNavigate={handleNavigate} />
      <main className="main">
        {selectedAthlete ? (
          <ProfilePage athlete={selectedAthlete} onBack={() => setSelectedAthlete(null)} />
        ) : (
          <>
            {page === 'athletes'   && <AthletesPage onViewProfile={setSelectedAthlete} />}
            {page === 'attendance' && <AttendancePage />}
            {page === 'results'    && <ResultsPage />}
          </>
        )}
      </main>
    </>
  );
}