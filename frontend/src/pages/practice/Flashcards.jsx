import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, ChevronLeft, ChevronRight, Loader, HelpCircle } from 'lucide-react';
import { vocabularyService } from '../../services/vocabulary.service';
import ExplanationPanel from '../../components/ExplanationPanel';

function Flashcards() {
  const [vocabList, setVocabList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    loadVocabulary();
  }, []);

  useEffect(() => {
    setShowAnswer(false);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ignore if user is typing in an input field
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNext();
          break;
        case ' ':
          event.preventDefault();
          toggleAnswer();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, showAnswer, vocabList]); // Dependencies ensure handlers use current state

  const loadVocabulary = async () => {
    try {
      const data = await vocabularyService.getAll(1, 1000);
      setVocabList(data.data || []);
    } catch (error) {
      console.error('Error loading vocabulary:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsStudied = async (id) => {
    try {
      await vocabularyService.markAsStudied(id);
    } catch (error) {
      console.error('Error marking as studied:', error);
    }
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

  const currentCard = vocabList[currentIndex];

  const handleNext = () => {
    if (currentIndex < vocabList.length - 1) {
      markAsStudied(currentCard.id);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
    if (!showAnswer) {
      markAsStudied(currentCard.id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Home
      </Link>

      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Card {currentIndex + 1} of {vocabList.length}
        </h2>
      </div>

      {/* Flashcard */}
      <div className="bg-white rounded-lg shadow-xl p-8 sm:p-12 mb-6 min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center">
        {!showAnswer ? (
          <div className="text-center">
            <div className="text-4xl sm:text-6xl font-bold text-gray-800 mb-4 sm:mb-6">
              {currentCard.chinese}
            </div>
            <div className="text-2xl sm:text-3xl text-gray-600 mb-6 sm:mb-8">
              {currentCard.pinyin}
            </div>
            <p className="text-gray-500 text-sm sm:text-lg">(Press Space or click button below to flip)</p>
          </div>
        ) : (
          <div className="text-center w-full">
            <div className="text-3xl sm:text-5xl font-bold text-green-600 mb-4 sm:mb-6">
              {currentCard.english}
            </div>
            {currentCard.example && (
              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-700 text-base sm:text-xl">{currentCard.example}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Show/Hide Answer and Explain Buttons */}
      <div className="flex justify-center gap-3 mb-6">
        <button
          onClick={toggleAnswer}
          className={`flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-white text-base sm:text-lg font-semibold transition-all transform hover:scale-105 ${
            showAnswer
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
              : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
          }`}
        >
          {showAnswer ? (
            <>
              <EyeOff className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
              Hide Answer
            </>
          ) : (
            <>
              <Eye className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
              Show Answer
            </>
          )}
        </button>

        <button
          onClick={() => setShowExplanation(true)}
          className="flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-base sm:text-lg font-semibold transition-all transform hover:scale-105"
        >
          <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
          Explain
        </button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-center mb-4">
        <p className="text-xs sm:text-sm text-gray-500">
          Keyboard shortcuts: <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">←</kbd> Previous ·
          <kbd className="px-2 py-1 bg-gray-200 rounded text-xs mx-1">Space</kbd> Flip ·
          <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">→</kbd> Next
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={`flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all text-sm sm:text-base ${
            currentIndex === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transform hover:scale-105'
          }`}
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === vocabList.length - 1}
          className={`flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all text-sm sm:text-base ${
            currentIndex === vocabList.length - 1
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transform hover:scale-105'
          }`}
        >
          Next
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
        </button>
      </div>

      {/* Explanation Panel */}
      {showExplanation && (
        <ExplanationPanel
          vocabularyId={currentCard.id}
          onClose={() => setShowExplanation(false)}
        />
      )}
    </div>
  );
}

export default Flashcards;
