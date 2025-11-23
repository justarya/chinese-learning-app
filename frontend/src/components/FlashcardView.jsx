import { useState, useEffect } from 'react'
import { ArrowLeft, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react'

function FlashcardView({ vocabList, markAsStudied, navigateTo }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  useEffect(() => {
    setShowAnswer(false)
  }, [currentIndex])

  if (vocabList.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </button>
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600 text-xl">No vocabulary available. Add some first!</p>
        </div>
      </div>
    )
  }

  const currentCard = vocabList[currentIndex]

  const handleNext = () => {
    if (currentIndex < vocabList.length - 1) {
      markAsStudied(currentCard.id)
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer)
    if (!showAnswer) {
      markAsStudied(currentCard.id)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigateTo('home')}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Home
      </button>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Card {currentIndex + 1} of {vocabList.length}
        </h2>
      </div>

      <div className="bg-white rounded-lg shadow-xl p-12 mb-6 min-h-[400px] flex flex-col items-center justify-center">
        {!showAnswer ? (
          <div className="text-center">
            <div className="text-6xl font-bold text-gray-800 mb-6">
              {currentCard.chinese}
            </div>
            <div className="text-3xl text-gray-600 mb-8">
              {currentCard.pinyin}
            </div>
            <p className="text-gray-500 text-lg">(Click button below to flip)</p>
          </div>
        ) : (
          <div className="text-center w-full">
            <div className="text-5xl font-bold text-green-600 mb-6">
              {currentCard.english}
            </div>
            {currentCard.example && (
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-700 text-xl">{currentCard.example}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={toggleAnswer}
          className={`flex items-center px-8 py-4 rounded-lg text-white text-lg font-semibold transition-all transform hover:scale-105 ${
            showAnswer
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
              : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
          }`}
        >
          {showAnswer ? (
            <>
              <EyeOff className="w-6 h-6 mr-2" />
              Hide Answer
            </>
          ) : (
            <>
              <Eye className="w-6 h-6 mr-2" />
              Show Answer
            </>
          )}
        </button>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={`flex items-center px-6 py-3 rounded-lg transition-all ${
            currentIndex === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transform hover:scale-105'
          }`}
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === vocabList.length - 1}
          className={`flex items-center px-6 py-3 rounded-lg transition-all ${
            currentIndex === vocabList.length - 1
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transform hover:scale-105'
          }`}
        >
          Next
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  )
}

export default FlashcardView
