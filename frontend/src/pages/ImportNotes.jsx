import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { vocabularyService } from '../services/vocabulary.service';

function ImportNotes() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleImport = async () => {
    if (!notes.trim()) {
      setError('Please enter some notes to import');
      return;
    }

    setLoading(true);
    setError('');
    setPreview(null);

    try {
      const result = await vocabularyService.import(notes);
      setPreview(result.vocabulary);
      setSuccess(true);
    } catch (err) {
      console.error('Import error:', err);
      setError(err.response?.data?.message || 'Failed to import notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setNotes('');
    setPreview(null);
    setError('');
    setSuccess(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Home
      </Link>

      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Import Vocabulary Notes</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
              Paste Your Notes
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm mb-4">
              AI will automatically extract Chinese characters, pinyin, English translation, and examples from your notes. Any format works!
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
              <p className="text-xs sm:text-sm text-gray-700 font-semibold mb-2">Example format:</p>
              <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap">
{`工厂 gong1chang3 = pabrik
水果店 shui guo = toko buah
面包店 mian bao dian toko roti`}
              </pre>
            </div>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your rough notes here..."
            className="w-full h-48 sm:h-64 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            disabled={loading}
          />

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {success && !error && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2 text-green-800 text-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>Successfully imported {preview?.length} vocabulary items!</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={handleImport}
              disabled={loading || !notes.trim()}
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg text-white text-base sm:text-lg font-semibold transition-all ${
                loading || !notes.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105'
              }`}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Import with AI
                </>
              )}
            </button>

            <button
              onClick={handleClear}
              disabled={loading}
              className="px-6 py-3 rounded-lg border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold transition-all"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
            Preview ({preview?.length || 0} items)
          </h3>

          {!preview && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Upload className="w-12 h-12 sm:w-16 sm:h-16 mb-4" />
              <p className="text-sm sm:text-base">Import preview will appear here</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 text-sm sm:text-base">AI is processing your notes...</p>
            </div>
          )}

          {preview && preview.length > 0 && (
            <>
              <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                {preview.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-1">
                      <span className="text-xl sm:text-2xl font-bold text-gray-800">
                        {item.chinese}
                      </span>
                      <span className="text-base sm:text-lg text-gray-600">{item.pinyin}</span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 mb-1">{item.english}</p>
                    {item.example && (
                      <p className="text-xs sm:text-sm text-gray-500 italic">{item.example}</p>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/vocabulary')}
                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold transition-all transform hover:scale-105"
              >
                View in Vocabulary List
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImportNotes;
