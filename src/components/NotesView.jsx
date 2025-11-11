import { useState } from 'react'
import { ArrowLeft, Save, Trash2, CheckCircle } from 'lucide-react'

function NotesView({ vocabList, addVocabulary, deleteVocabulary, studiedCards, navigateTo }) {
  const [notesInput, setNotesInput] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const parseNotes = () => {
    setErrorMessage('')

    if (!notesInput.trim()) {
      setErrorMessage('Please enter some vocabulary notes.')
      return
    }

    const lines = notesInput.trim().split('\n')
    const newVocab = []
    let hasError = false

    lines.forEach((line, index) => {
      if (!line.trim()) return

      const parts = line.split('|').map(part => part.trim())

      if (parts.length < 3) {
        setErrorMessage(`Line ${index + 1}: Invalid format. Need at least: Chinese | Pinyin | English`)
        hasError = true
        return
      }

      const [chinese, pinyin, english, example = ''] = parts

      if (!chinese || !pinyin || !english) {
        setErrorMessage(`Line ${index + 1}: Missing required fields`)
        hasError = true
        return
      }

      newVocab.push({
        id: Date.now() + index,
        chinese,
        pinyin,
        english,
        example
      })
    })

    if (!hasError && newVocab.length > 0) {
      addVocabulary(newVocab)
      setNotesInput('')
      setErrorMessage('')
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

      <h2 className="text-3xl font-bold text-gray-800 mb-6">Manage Vocabulary</h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <p className="text-gray-700 mb-2">
            <strong>Format:</strong> Chinese | Pinyin | English | Example (optional)
          </p>
          <p className="text-gray-600 text-sm">
            <strong>Example:</strong> 你好 | nǐ hǎo | hello | 你好，很高兴认识你
          </p>
        </div>

        <textarea
          value={notesInput}
          onChange={(e) => setNotesInput(e.target.value)}
          placeholder="Paste your notes here...&#10;&#10;你好 | nǐ hǎo | hello | 你好，很高兴认识你&#10;学习 | xué xí | to study | 我每天学习中文"
          className="w-full h-48 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />

        {errorMessage && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-800">
            {errorMessage}
          </div>
        )}

        <button
          onClick={parseNotes}
          className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg px-6 py-3 flex items-center transition-all transform hover:scale-105"
        >
          <Save className="w-5 h-5 mr-2" />
          Add Vocabulary
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Your Vocabulary ({vocabList.length})
        </h3>

        {vocabList.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No vocabulary added yet. Add some above to get started!
          </p>
        ) : (
          <div className="space-y-4">
            {vocabList.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold text-gray-800">
                        {item.chinese}
                      </span>
                      <span className="text-lg text-gray-600">{item.pinyin}</span>
                      {studiedCards.has(item.id) && (
                        <span className="flex items-center text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Studied
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-1">{item.english}</p>
                    {item.example && (
                      <p className="text-gray-500 text-sm italic">{item.example}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteVocabulary(item.id)}
                    className="text-red-500 hover:text-red-700 transition-colors ml-4"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotesView
