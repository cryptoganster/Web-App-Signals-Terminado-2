import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/auth/LoginForm';
import { UserDashboard } from './components/user/UserDashboard';
import { HistoryView } from './components/history/HistoryView';
import { Navigation } from './components/navigation/Navigation';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated, user } = useAuth();
  const [showNewSignal, setShowNewSignal] = React.useState(false);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation onAddNewSignal={() => setShowNewSignal(true)} />
        <Routes>
          <Route path="/" element={<UserDashboard showNewSignal={showNewSignal} onNewSignalClose={() => setShowNewSignal(false)} />} />
          <Route path="/history" element={<HistoryView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;