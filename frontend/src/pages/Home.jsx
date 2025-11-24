import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, BookMarked, Languages, ArrowRightLeft, MessageSquare, Upload } from 'lucide-react';
import { vocabularyService } from '../services/vocabulary.service';
import { studyService } from '../services/study.service';

function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalVocab: 0,
    studiedCount: 0,
    scorePercentage: 0,
    scores: { translation: 0, total: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [vocabData, progress] = await Promise.all([
        vocabularyService.getAll(1, 1000),
        studyService.getProgress()
      ]);

      const totalVocab = vocabData.total || 0;
      const studiedCount = vocabData.data.filter(v => v.studiedCount > 0).length;
      const scorePercentage = progress.translationTotal > 0
        ? Math.round((progress.translationScore / progress.translationTotal) * 100)
        : 0;

      setStats({
        totalVocab,
        studiedCount,
        scorePercentage,
        scores: {
          translation: progress.translationScore || 0,
          total: progress.translationTotal || 0
        }
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">中文学习助手</h1>
        <h2 className="text-xl sm:text-2xl text-gray-600">Chinese Learning Assistant</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">{stats.totalVocab}</div>
          <div className="text-sm sm:text-base text-gray-600">Total Vocabulary</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">{stats.studiedCount}</div>
          <div className="text-sm sm:text-base text-gray-600">Cards Studied</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">{stats.scorePercentage}%</div>
          <div className="text-sm sm:text-base text-gray-600">Translation Score</div>
          <div className="text-xs sm:text-sm text-gray-500 mt-1">
            {stats.scores.translation} correct out of {stats.scores.total}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <button
          onClick={() => navigate('/import')}
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg shadow-md p-4 sm:p-6 transition-all transform hover:scale-105"
        >
          <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3" />
          <div className="text-lg sm:text-xl font-semibold">Import Notes (AI)</div>
        </button>

        <button
          onClick={() => navigate('/vocabulary')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md p-4 sm:p-6 transition-all transform hover:scale-105"
        >
          <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3" />
          <div className="text-lg sm:text-xl font-semibold">Manage Vocabulary</div>
        </button>

        <button
          onClick={() => navigate('/practice/flashcards')}
          disabled={stats.totalVocab === 0}
          className={`bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow-md p-4 sm:p-6 transition-all transform hover:scale-105 ${
            stats.totalVocab === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <BookMarked className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3" />
          <div className="text-lg sm:text-xl font-semibold">Flashcards</div>
        </button>

        <button
          onClick={() => navigate('/study/translation/en-zh')}
          disabled={stats.totalVocab === 0}
          className={`bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg shadow-md p-4 sm:p-6 transition-all transform hover:scale-105 ${
            stats.totalVocab === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Languages className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3" />
          <div className="text-lg sm:text-xl font-semibold">EN → 中文</div>
        </button>

        <button
          onClick={() => navigate('/study/translation/zh-en')}
          disabled={stats.totalVocab === 0}
          className={`bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-lg shadow-md p-4 sm:p-6 transition-all transform hover:scale-105 ${
            stats.totalVocab === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <ArrowRightLeft className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3" />
          <div className="text-lg sm:text-xl font-semibold">中文 → EN</div>
        </button>

        <button
          onClick={() => navigate('/conversation')}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg shadow-md p-4 sm:p-6 transition-all transform hover:scale-105"
        >
          <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3" />
          <div className="text-lg sm:text-xl font-semibold">Chat in Chinese 💬</div>
        </button>
      </div>

      {stats.totalVocab === 0 && (
        <div className="mt-6 sm:mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800 text-sm sm:text-base">
            Get started by importing vocabulary or adding it manually!
          </p>
        </div>
      )}
    </div>
  );
}

export default Home;
