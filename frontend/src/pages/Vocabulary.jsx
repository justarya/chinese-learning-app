import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, CheckCircle, Loader } from 'lucide-react';
import { vocabularyService } from '../services/vocabulary.service';

function Vocabulary() {
  const [vocabList, setVocabList] = useState([]);
  const [studiedIds, setStudiedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVocabulary();
  }, []);

  const loadVocabulary = async () => {
    try {
      const data = await vocabularyService.getAll(1, 1000);
      setVocabList(data.data || []);
      const studied = new Set(data.data.filter(v => v.studiedCount > 0).map(v => v.id));
      setStudiedIds(studied);
    } catch (error) {
      console.error('Error loading vocabulary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this vocabulary item?')) return;

    try {
      await vocabularyService.delete(id);
      setVocabList(vocabList.filter(item => item.id !== id));
      const newStudied = new Set(studiedIds);
      newStudied.delete(id);
      setStudiedIds(newStudied);
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
      alert('Failed to delete vocabulary');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Home
      </Link>

      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
        Your Vocabulary ({vocabList.length})
      </h2>

      {vocabList.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
          <p className="text-gray-600 text-base sm:text-lg mb-6">
            No vocabulary yet. Import some notes to get started!
          </p>
          <Link
            to="/import"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
          >
            Import Notes with AI
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Compact list */}
          <div className="divide-y divide-gray-200">
            {vocabList.map((item) => (
              <div
                key={item.id}
                className="p-3 sm:p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg sm:text-xl font-bold text-gray-800">
                        {item.chinese}
                      </span>
                      <span className="text-sm sm:text-base text-gray-600">{item.pinyin}</span>
                      {studiedIds.has(item.id) && (
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" title="Studied" />
                      )}
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 mb-1">{item.english}</p>
                    {item.example && (
                      <p className="text-xs sm:text-sm text-gray-500 italic truncate">{item.example}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0 p-1"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Vocabulary;
