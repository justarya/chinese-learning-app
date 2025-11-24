import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginView from './components/LoginView';
import AuthCallback from './components/AuthCallback';
import Home from './pages/Home';
import ImportNotes from './pages/ImportNotes';
import Vocabulary from './pages/Vocabulary';
import Flashcards from './pages/practice/Flashcards';
import Translation from './pages/study/Translation';
import Conversation from './pages/Conversation';
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginView />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected routes with layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/import" element={<ImportNotes />} />
              <Route path="/vocabulary" element={<Vocabulary />} />
              <Route path="/practice/flashcards" element={<Flashcards />} />
              <Route path="/study/translation/:mode" element={<Translation />} />
              <Route path="/conversation" element={<Conversation />} />
              <Route path="/conversation/:sessionId" element={<Conversation />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
