import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Eye, Loader, BookOpen, HelpCircle, RotateCcw, SkipForward } from 'lucide-react';
import { translationService } from '../../services/translation.service';
import { studyService } from '../../services/study.service';
import ExplanationPanel from '../../components/ExplanationPanel';

function Translation() {
  const { mode } = useParams(); // 'en-zh' or 'zh-en'
  const [currentSentence, setCurrentSentence] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [scores, setScores] = useState({ translation: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedVocabId, setSelectedVocabId] = useState(null);

  useEffect(() => {
    loadProgress();
    generateNewSentence();
  }, [mode]);

  const loadProgress = async () => {
    try {
      const progress = await studyService.getProgress();
      setScores({
        translation: progress.translationScore || 0,
        total: progress.translationTotal || 0
      });
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const generateNewSentence = async () => {
    setGenerating(true);
    setUserAnswer('');
    setShowResult(false);
    setValidationResult(null);

    try {
      const sentence = await translationService.generateSentence(mode);
      setCurrentSentence(sentence);
    } catch (error) {
      console.error('Error generating sentence:', error);
    } finally {
      setGenerating(false);
    }
  };

  const checkAnswer = async () => {
    if (!currentSentence || !userAnswer.trim()) return;

    setLoading(true);
    try {
      const result = await translationService.validateAnswer(
        currentSentence.id,
        userAnswer.trim()
      );

      setValidationResult(result);
      setShowResult(true);

      const newScores = {
        translation: scores.translation + (result.isCorrect ? 1 : 0),
        total: scores.total + 1
      };
      setScores(newScores);

      await studyService.logSession(
        `translation-${mode}`,
        result.isCorrect ? 1 : 0,
        1,
        0
      );
    } catch (error) {
      console.error('Error validating answer:', error);
    } finally {
      setLoading(false);
    }
  };

  const peekAnswer = () => {
    setShowResult(true);
    setValidationResult({
      isCorrect: false,
      feedback: 'You peeked at the answer!',
      correctAnswer: mode === 'en-zh' ? currentSentence.chineseSentence : currentSentence.englishSentence
    });
  };

  const tryAgain = () => {
    setUserAnswer('');
    setShowResult(false);
    setValidationResult(null);
  };

  const skipQuestion = async () => {
    if (!currentSentence) return;

    setGenerating(true);
    try {
      await translationService.skipSentence(currentSentence.id);
      await generateNewSentence();
    } catch (error) {
      console.error('Error skipping question:', error);
      setGenerating(false);
    }
  };

  const scorePercentage = scores.total > 0 ? Math.round((scores.translation / scores.total) * 100) : 0;

  if (generating) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Generating a sentence for you...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentSentence) {
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

        <div className="bg-white rounded-lg shadow-xl p-12 text-center">
          <div className="mb-6">
            <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to Practice?</h3>
            <p className="text-gray-600 mb-2">
              Click the button below to generate a new translation sentence.
            </p>
            <p className="text-sm text-gray-500">
              The AI will create a sentence using your vocabulary words.
            </p>
          </div>

          <button
            onClick={generateNewSentence}
            disabled={generating}
            className={`px-8 py-4 rounded-lg text-white text-lg font-semibold transition-all transform hover:scale-105 ${
              generating
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg'
            }`}
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <Loader className="w-5 h-5 animate-spin" />
                Generating...
              </span>
            ) : (
              'Generate Sentence'
            )}
          </button>

          {scores.total === 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Make sure you have some vocabulary added first. You can import vocabulary from the home page!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

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
        <div className="mb-4">
          <p className="text-gray-600 text-base sm:text-lg mb-2">Translate this sentence:</p>
          {currentSentence.vocabularyUsed && currentSentence.vocabularyUsed.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-gray-500">
                Using vocabulary: {currentSentence.vocabularyUsed.map(v => v.chinese).join(', ')}
              </p>
            </div>
          )}
          {currentSentence.difficulty && (
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
              currentSentence.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
              currentSentence.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {currentSentence.difficulty}
            </span>
          )}
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6 sm:mb-8 p-4 sm:p-6 bg-blue-50 rounded-lg">
          {currentSentence.questionSentence}
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
                disabled={!userAnswer.trim() || loading}
                className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg text-white text-base sm:text-lg font-semibold transition-all transform hover:scale-105 ${
                  !userAnswer.trim() || loading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                }`}
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Check Answer
                  </>
                )}
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
            <div className={`text-center p-4 sm:p-6 rounded-lg mb-4 ${
              validationResult?.isCorrect ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
            }`}>
              <span className={`text-xl sm:text-2xl font-bold ${validationResult?.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {validationResult?.isCorrect ? '✓ Correct!' : '✗ Not quite right'}
              </span>
            </div>

            {validationResult?.feedback && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm sm:text-base text-gray-700">{validationResult.feedback}</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-4">
              <p className="text-gray-600 mb-2">Correct answer:</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">{validationResult?.correctAnswer}</p>
              {currentSentence.vocabularyUsed && currentSentence.vocabularyUsed.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Vocabulary used:</p>
                  <div className="space-y-2">
                    {currentSentence.vocabularyUsed.map((vocab, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm hover:bg-gray-100 p-2 rounded transition-colors">
                        <div>
                          <span className="font-bold">{vocab.chinese}</span>
                          <span className="text-gray-500 mx-2">{vocab.pinyin}</span>
                          <span className="text-gray-700">{vocab.english}</span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedVocabId(vocab.id);
                            setShowExplanation(true);
                          }}
                          className="ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Explain this word"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {validationResult?.isCorrect ? (
              // Show "Next Question" button if answer was correct
              <button
                onClick={generateNewSentence}
                disabled={generating}
                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-base sm:text-lg font-semibold transition-all transform hover:scale-105"
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  'Next Question'
                )}
              </button>
            ) : (
              // Show "Try Again" and "Skip" buttons if answer was incorrect
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={tryAgain}
                  className="flex-1 flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white text-base sm:text-lg font-semibold transition-all transform hover:scale-105"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Try Again
                </button>
                <button
                  onClick={skipQuestion}
                  disabled={generating}
                  className="flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white text-base sm:text-lg font-semibold transition-all transform hover:scale-105"
                >
                  {generating ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Skipping...
                    </>
                  ) : (
                    <>
                      <SkipForward className="w-5 h-5 mr-2" />
                      Skip
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Explanation Panel */}
      {showExplanation && selectedVocabId && (
        <ExplanationPanel
          vocabularyId={selectedVocabId}
          onClose={() => {
            setShowExplanation(false);
            setSelectedVocabId(null);
          }}
        />
      )}
    </div>
  );
}

export default Translation;
