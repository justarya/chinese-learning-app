import { useState, useEffect } from 'react'
import { ArrowLeft, Check, Eye, MessageCircle, X } from 'lucide-react'

function TranslationView({ vocabList, mode, updateScore, scores, navigateTo }) {
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showAIHelp, setShowAIHelp] = useState(false)
  const [aiHelp, setAIHelp] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)

  useEffect(() => {
    generateQuestion()
  }, [vocabList, mode])

  const generateQuestion = () => {
    if (vocabList.length === 0) return

    const randomIndex = Math.floor(Math.random() * vocabList.length)
    setCurrentQuestion(vocabList[randomIndex])
    setUserAnswer('')
    setShowResult(false)
    setIsCorrect(false)
    setShowAIHelp(false)
    setAIHelp('')
  }

  const checkAnswer = () => {
    if (!currentQuestion || !userAnswer.trim()) return

    const correctAnswer = mode === 'en-zh' ? currentQuestion.chinese : currentQuestion.english
    const correct = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase()

    setIsCorrect(correct)
    setShowResult(true)
    updateScore(correct)
  }

  const peekAnswer = () => {
    setShowResult(true)
    setIsCorrect(false)
  }

  const getAIHelp = async () => {
    setLoadingAI(true)
    setShowAIHelp(true)

    try {
      // Simulated AI response - In production, this would call the Anthropic API
      // Since we're in Claude.ai, we can use the native API
      const prompt = `Provide a word-by-word breakdown and grammar explanation for this Chinese phrase: "${currentQuestion.chinese}" (pinyin: ${currentQuestion.pinyin}, meaning: ${currentQuestion.english}). Be concise and educational.`

      // Simulated response for now - will be replaced with actual API call
      const mockResponse = `Breaking down "${currentQuestion.chinese}" (${currentQuestion.pinyin}):\n\n` +
        `This phrase means "${currentQuestion.english}".\n\n` +
        `Character breakdown:\n` +
        `${currentQuestion.chinese.split('').map((char, i) => `• ${char} - part of the word`).join('\n')}\n\n` +
        `The pinyin pronunciation is: ${currentQuestion.pinyin}`

      setAIHelp(mockResponse)
    } catch (error) {
      setAIHelp('Sorry, could not load AI help at this time.')
    } finally {
      setLoadingAI(false)
    }
  }

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

  if (!currentQuestion) return null

  const scorePercentage = scores.total > 0 ? Math.round((scores.translation / scores.total) * 100) : 0
  const questionText = mode === 'en-zh' ? currentQuestion.english : currentQuestion.chinese
  const correctAnswer = mode === 'en-zh' ? currentQuestion.chinese : currentQuestion.english

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
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {mode === 'en-zh' ? 'English → Chinese' : 'Chinese → English'}
        </h2>
        <p className="text-xl text-green-600 font-semibold">Score: {scorePercentage}%</p>
        <p className="text-gray-600">
          {scores.translation} correct out of {scores.total} attempts
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
        <p className="text-gray-600 text-lg mb-4">Translate this:</p>
        <div className="text-4xl font-bold text-gray-800 text-center mb-8 p-6 bg-blue-50 rounded-lg">
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
              className="w-full border border-gray-300 rounded-lg p-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />

            <div className="flex gap-4">
              <button
                onClick={checkAnswer}
                disabled={!userAnswer.trim()}
                className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg text-white text-lg font-semibold transition-all transform hover:scale-105 ${
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
                className="flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg font-semibold transition-all transform hover:scale-105"
              >
                <Eye className="w-5 h-5 mr-2" />
                Peek
              </button>
            </div>
          </>
        ) : (
          <div>
            <div className={`text-center p-6 rounded-lg mb-6 ${
              isCorrect ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
            }`}>
              <div className="flex items-center justify-center mb-2">
                {isCorrect ? (
                  <>
                    <Check className="w-8 h-8 text-green-600 mr-2" />
                    <span className="text-2xl font-bold text-green-600">Correct!</span>
                  </>
                ) : (
                  <>
                    <X className="w-8 h-8 text-red-600 mr-2" />
                    <span className="text-2xl font-bold text-red-600">Not quite right</span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-4">
              <p className="text-gray-600 mb-2">Correct answer:</p>
              <p className="text-3xl font-bold text-gray-800 mb-2">{correctAnswer}</p>
              <p className="text-xl text-gray-600 mb-3">{currentQuestion.pinyin}</p>
              {currentQuestion.example && (
                <p className="text-gray-700 italic">Example: {currentQuestion.example}</p>
              )}
            </div>

            <div className="flex gap-4 mb-4">
              <button
                onClick={generateQuestion}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-lg font-semibold transition-all transform hover:scale-105"
              >
                Next Question
              </button>

              <button
                onClick={getAIHelp}
                className="flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-lg font-semibold transition-all transform hover:scale-105"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                AI Help
              </button>
            </div>

            {showAIHelp && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-purple-900">AI Grammar Help:</h3>
                  <button
                    onClick={() => setShowAIHelp(false)}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {loadingAI ? (
                  <p className="text-gray-600">Loading explanation...</p>
                ) : (
                  <p className="text-gray-700 whitespace-pre-line">{aiHelp}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TranslationView
