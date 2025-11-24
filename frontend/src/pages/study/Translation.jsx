import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Eye, Loader } from 'lucide-react';
import { vocabularyService } from '../../services/vocabulary.service';
import { studyService } from '../../services/study.service';

function Translation() {
  const { mode } = useParams(); // 'en-zh' or 'zh-en'
  const [vocabList, setVocabList] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [scores, setScores] = useState({ translation: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (vocabList.length > 0) {
      generateQuestion();
    }
  }, [vocabList, mode]);

  const loadData = async () => {
    try {
      const [vocabData, progress] = await Promise.all([
        vocabularyService.getAll(1, 1000),
        studyService.getProgress()
      ]);

      setVocabList(vocabData.data || []);
      setScores({
        translation: progress.translationScore || 0,
        total: progress.translationTotal || 0
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuestion = () => {
    if (vocabList.length === 0) return;

    const randomIndex = Math.floor(Math.random() * vocabList.length);
    setCurrentQuestion(vocabList[randomIndex]);
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
  };

  const checkAnswer = async () => {
    if (!currentQuestion || !userAnswer.trim()) return;

    const correctAnswer = mode === 'en-zh' ? currentQuestion.chinese : currentQuestion.english;
    const correct = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();

    setIsCorrect(correct);
    setShowResult(true);

    const newScores = {
      translation: scores.translation + (correct ? 1 : 0),
      total: scores.total + 1
    };
    setScores(newScores);

    try {
      await studyService.logSession(
        `translation-${mode}`,
        correct ? 1 : 0,
        1,
        0
      );
    } catch (error) {
      console.error('Error logging study session:', error);
    }
  };

  const peekAnswer = () => {
    setShowResult(true);
    setIsCorrect(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (vocabList.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600 text-lg">No vocabulary available. Add some first!</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const scorePercentage = scores.total > 0 ? Math.round((scores.translation / scores.total) * 100) : 0;
  const questionText = mode === 'en-zh' ? currentQuestion.english : currentQuestion.chinese;
  const correctAnswer = mode === 'en-zh' ? currentQuestion.chinese : currentQuestion.english;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Home
      </Link>

      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          {mode === 'en-zh' ? 'English → Chinese' : 'Chinese → English'}
        </h2>
        <p className="text-lg sm:text-xl text-green-600 font-semibold">Score: {scorePercentage}%</p>
        <p className="text-sm sm:text-base text-gray-600">
          {scores.translation} correct out of {scores.total} attempts
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 mb-6">
        <p className="text-gray-600 text-base sm:text-lg mb-4">Translate this:</p>
        <div className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-6 sm:mb-8 p-4 sm:p-6 bg-blue-50 rounded-lg">
          {questionText}
        </div>

        {!showResult ? (
          <>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
              placeholder="Type your answer here..."
              className="w-full border border-gray-300 rounded-lg p-3 sm:p-4 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={checkAnswer}
                disabled={!userAnswer.trim()}
                className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg text-white text-base sm:text-lg font-semibold transition-all transform hover:scale-105 ${
                  !userAnswer.trim()
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                }`}
              >
                <Check className="w-5 h-5 mr-2" />
                Check Answer
              </button>

              <button
                onClick={peekAnswer}
                className="flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-base sm:text-lg font-semibold transition-all transform hover:scale-105"
              >
                <Eye className="w-5 h-5 mr-2" />
                Peek
              </button>
            </div>
          </>
        ) : (
          <div>
            <div className={`text-center p-4 sm:p-6 rounded-lg mb-6 ${
              isCorrect ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
            }`}>
              <span className={`text-xl sm:text-2xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? '✓ Correct!' : '✗ Not quite right'}
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-4">
              <p className="text-gray-600 mb-2">Correct answer:</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{correctAnswer}</p>
              <p className="text-lg sm:text-xl text-gray-600 mb-3">{currentQuestion.pinyin}</p>
              {currentQuestion.example && (
                <p className="text-sm sm:text-base text-gray-700 italic">Example: {currentQuestion.example}</p>
              )}
            </div>

            <button
              onClick={generateQuestion}
              className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-base sm:text-lg font-semibold transition-all transform hover:scale-105"
            >
              Next Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Translation;
