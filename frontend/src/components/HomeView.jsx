import { BookOpen, GraduationCap, MessageSquare, BookMarked, Languages, ArrowRightLeft, Upload } from 'lucide-react'

function HomeView({ vocabList, studiedCards, scores, navigateTo }) {
  const totalVocab = vocabList.length
  const studiedCount = studiedCards.size
  const scorePercentage = scores.total > 0 ? Math.round((scores.translation / scores.total) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">中文学习助手</h1>
        <h2 className="text-2xl text-gray-600">Chinese Learning Assistant</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{totalVocab}</div>
          <div className="text-gray-600">Total Vocabulary</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{studiedCount}</div>
          <div className="text-gray-600">Cards Studied</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{scorePercentage}%</div>
          <div className="text-gray-600">Translation Score</div>
          <div className="text-sm text-gray-500 mt-1">
            {scores.translation} correct out of {scores.total}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => navigateTo('import')}
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg shadow-md p-6 transition-all transform hover:scale-105"
        >
          <Upload className="w-12 h-12 mx-auto mb-3" />
          <div className="text-xl font-semibold">Import Notes (AI)</div>
        </button>

        <button
          onClick={() => navigateTo('notes')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md p-6 transition-all transform hover:scale-105"
        >
          <BookOpen className="w-12 h-12 mx-auto mb-3" />
          <div className="text-xl font-semibold">Manage Notes</div>
        </button>

        <button
          onClick={() => navigateTo('flashcard')}
          disabled={totalVocab === 0}
          className={`bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow-md p-6 transition-all transform hover:scale-105 ${
            totalVocab === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <BookMarked className="w-12 h-12 mx-auto mb-3" />
          <div className="text-xl font-semibold">Flashcards</div>
        </button>

        <button
          onClick={() => navigateTo('translation', 'en-zh')}
          disabled={totalVocab === 0}
          className={`bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg shadow-md p-6 transition-all transform hover:scale-105 ${
            totalVocab === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Languages className="w-12 h-12 mx-auto mb-3" />
          <div className="text-xl font-semibold">EN → 中文</div>
        </button>

        <button
          onClick={() => navigateTo('translation', 'zh-en')}
          disabled={totalVocab === 0}
          className={`bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-lg shadow-md p-6 transition-all transform hover:scale-105 ${
            totalVocab === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <ArrowRightLeft className="w-12 h-12 mx-auto mb-3" />
          <div className="text-xl font-semibold">中文 → EN</div>
        </button>

        <button
          onClick={() => navigateTo('conversation')}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg shadow-md p-6 transition-all transform hover:scale-105 md:col-span-2"
        >
          <MessageSquare className="w-12 h-12 mx-auto mb-3" />
          <div className="text-xl font-semibold">Chat in Chinese 💬</div>
        </button>
      </div>

      {totalVocab === 0 && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">
            Get started by adding vocabulary in the Notes Manager!
          </p>
        </div>
      )}
    </div>
  )
}

export default HomeView
