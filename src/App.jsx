import { useState, useEffect } from 'react'
import HomeView from './components/HomeView'
import NotesView from './components/NotesView'
import FlashcardView from './components/FlashcardView'
import TranslationView from './components/TranslationView'
import ConversationView from './components/ConversationView'

function App() {
  // State management
  const [currentView, setCurrentView] = useState('home')
  const [vocabList, setVocabList] = useState([])
  const [studiedCards, setStudiedCards] = useState(new Set())
  const [scores, setScores] = useState({ translation: 0, total: 0 })
  const [translationMode, setTranslationMode] = useState('en-zh') // 'en-zh' or 'zh-en'

  // Load data from storage on mount
  useEffect(() => {
    loadData()
  }, [])

  // Save data to storage whenever it changes
  useEffect(() => {
    saveData()
  }, [vocabList, studiedCards, scores])

  const loadData = () => {
    try {
      const savedVocab = localStorage.getItem('chinese-vocab')
      const savedStudied = localStorage.getItem('chinese-studied')
      const savedScores = localStorage.getItem('chinese-scores')

      if (savedVocab) {
        setVocabList(JSON.parse(savedVocab))
      }
      if (savedStudied) {
        setStudiedCards(new Set(JSON.parse(savedStudied)))
      }
      if (savedScores) {
        setScores(JSON.parse(savedScores))
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const saveData = () => {
    try {
      localStorage.setItem('chinese-vocab', JSON.stringify(vocabList))
      localStorage.setItem('chinese-studied', JSON.stringify([...studiedCards]))
      localStorage.setItem('chinese-scores', JSON.stringify(scores))
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }

  const addVocabulary = (newVocab) => {
    setVocabList([...vocabList, ...newVocab])
  }

  const deleteVocabulary = (id) => {
    setVocabList(vocabList.filter(item => item.id !== id))
    const newStudied = new Set(studiedCards)
    newStudied.delete(id)
    setStudiedCards(newStudied)
  }

  const markAsStudied = (id) => {
    const newStudied = new Set(studiedCards)
    newStudied.add(id)
    setStudiedCards(newStudied)
  }

  const updateScore = (correct) => {
    setScores({
      translation: scores.translation + (correct ? 1 : 0),
      total: scores.total + 1
    })
  }

  const navigateTo = (view, mode = null) => {
    setCurrentView(view)
    if (mode) {
      setTranslationMode(mode)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {currentView === 'home' && (
        <HomeView
          vocabList={vocabList}
          studiedCards={studiedCards}
          scores={scores}
          navigateTo={navigateTo}
        />
      )}
      {currentView === 'notes' && (
        <NotesView
          vocabList={vocabList}
          addVocabulary={addVocabulary}
          deleteVocabulary={deleteVocabulary}
          studiedCards={studiedCards}
          navigateTo={navigateTo}
        />
      )}
      {currentView === 'flashcard' && (
        <FlashcardView
          vocabList={vocabList}
          markAsStudied={markAsStudied}
          navigateTo={navigateTo}
        />
      )}
      {currentView === 'translation' && (
        <TranslationView
          vocabList={vocabList}
          mode={translationMode}
          updateScore={updateScore}
          scores={scores}
          navigateTo={navigateTo}
        />
      )}
      {currentView === 'conversation' && (
        <ConversationView
          navigateTo={navigateTo}
        />
      )}
    </div>
  )
}

export default App
