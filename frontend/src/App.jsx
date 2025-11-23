import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginView from './components/LoginView';
import AuthCallback from './components/AuthCallback';
import HomeView from './components/HomeView';
import NotesView from './components/NotesView';
import ImportNotesView from './components/ImportNotesView';
import FlashcardView from './components/FlashcardView';
import TranslationView from './components/TranslationView';
import ConversationView from './components/ConversationView';
import { vocabularyService } from './services/vocabulary.service';
import { studyService } from './services/study.service';
import { LogOut, Loader } from 'lucide-react';

function AppContent() {
  const { user, loading: authLoading, logout, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [vocabList, setVocabList] = useState([]);
  const [studiedCards, setStudiedCards] = useState(new Set());
  const [scores, setScores] = useState({ translation: 0, total: 0 });
  const [translationMode, setTranslationMode] = useState('en-zh');
  const [loading, setLoading] = useState(true);

  // Check if we're on auth callback
  const isAuthCallback = window.location.pathname === '/auth/callback' ||
                         window.location.search.includes('token=');

  // Load data from API when authenticated
  useEffect(() => {
    if (isAuthenticated && !isAuthCallback) {
      loadDataFromAPI();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isAuthCallback]);

  const loadDataFromAPI = async () => {
    try {
      setLoading(true);

      // Load vocabulary
      const vocabData = await vocabularyService.getAll();
      setVocabList(vocabData.data || []);

      // Calculate studied cards from vocabulary
      const studied = new Set(
        vocabData.data.filter(v => v.studiedCount > 0).map(v => v.id)
      );
      setStudiedCards(studied);

      // Load study progress for scores
      const progress = await studyService.getProgress();
      setScores({
        translation: progress.translationScore || 0,
        total: progress.translationTotal || 0,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addVocabulary = async (newVocab) => {
    // Refresh vocabulary list from API
    await loadDataFromAPI();
  };

  const deleteVocabulary = async (id) => {
    try {
      await vocabularyService.delete(id);
      setVocabList(vocabList.filter(item => item.id !== id));
      const newStudied = new Set(studiedCards);
      newStudied.delete(id);
      setStudiedCards(newStudied);
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
    }
  };

  const markAsStudied = async (id) => {
    try {
      await vocabularyService.markAsStudied(id);
      const newStudied = new Set(studiedCards);
      newStudied.add(id);
      setStudiedCards(newStudied);
    } catch (error) {
      console.error('Error marking as studied:', error);
    }
  };

  const updateScore = async (correct) => {
    const newScores = {
      translation: scores.translation + (correct ? 1 : 0),
      total: scores.total + 1,
    };
    setScores(newScores);

    // Log to backend
    try {
      await studyService.logSession(
        `translation-${translationMode}`,
        correct ? 1 : 0,
        1,
        0
      );
    } catch (error) {
      console.error('Error logging study session:', error);
    }
  };

  const navigateTo = (view, mode = null) => {
    setCurrentView(view);
    if (mode) {
      setTranslationMode(mode);
    }
  };

  const handleImportSuccess = (importedVocab) => {
    // Refresh data after import
    loadDataFromAPI();
  };

  // Show auth callback loading
  if (isAuthCallback) {
    return <AuthCallback />;
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <LoginView />;
  }

  // Show loading while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 text-xl">Loading your data...</p>
        </div>
      </div>
    );
  }

  // Main app content
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* User info bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {user?.picture && (
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-gray-700 font-medium">{user?.name || user?.email}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Views */}
      {currentView === 'home' && (
        <HomeView
          vocabList={vocabList}
          studiedCards={studiedCards}
          scores={scores}
          navigateTo={navigateTo}
        />
      )}
      {currentView === 'notes' && (
        <NotesView
          vocabList={vocabList}
          addVocabulary={addVocabulary}
          deleteVocabulary={deleteVocabulary}
          studiedCards={studiedCards}
          navigateTo={navigateTo}
        />
      )}
      {currentView === 'import' && (
        <ImportNotesView
          navigateTo={navigateTo}
          onImportSuccess={handleImportSuccess}
        />
      )}
      {currentView === 'flashcard' && (
        <FlashcardView
          vocabList={vocabList}
          markAsStudied={markAsStudied}
          navigateTo={navigateTo}
        />
      )}
      {currentView === 'translation' && (
        <TranslationView
          vocabList={vocabList}
          mode={translationMode}
          updateScore={updateScore}
          scores={scores}
          navigateTo={navigateTo}
        />
      )}
      {currentView === 'conversation' && (
        <ConversationView
          navigateTo={navigateTo}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
