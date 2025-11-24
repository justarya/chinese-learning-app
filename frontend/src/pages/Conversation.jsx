import { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Send, MessageCircle, Loader, ChevronRight, ChevronLeft, Check, X, Eye, EyeOff } from 'lucide-react';
import { chatService } from '../services/chat.service';
import { vocabularyService } from '../services/vocabulary.service';

const SCENARIOS = [
  { id: 'free', label: 'Free Conversation', description: 'Open conversation practice' },
  { id: 'restaurant', label: 'At a Restaurant', description: 'Ordering food and drinks' },
  { id: 'park', label: 'At the Park', description: 'Outdoor activities' },
  { id: 'shopping', label: 'Shopping', description: 'Buying things at a store' },
  { id: 'work', label: 'At Work', description: 'Office conversations' },
  { id: 'home', label: 'At Home', description: 'Daily home life' },
  { id: 'travel', label: 'Traveling', description: 'Transportation and directions' },
];

function Conversation() {
  const { sessionId } = useParams();
  const [currentSessionId, setCurrentSessionId] = useState(sessionId || null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Scenario and vocabulary selection
  const [selectedScenario, setSelectedScenario] = useState('free');
  const [showVocabSelector, setShowVocabSelector] = useState(false);
  const [vocabularyList, setVocabularyList] = useState([]);
  const [selectedVocabIds, setSelectedVocabIds] = useState([]);
  const [autoSelectMode, setAutoSelectMode] = useState('recent'); // 'recent', 'least-practiced', 'all'

  // Vocabulary cheat sheet sidebar
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [sessionVocabulary, setSessionVocabulary] = useState([]);
  const [revealedWords, setRevealedWords] = useState(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadVocabulary();
  }, []);

  useEffect(() => {
    if (currentSessionId) {
      loadSessionVocabulary();
    }
  }, [currentSessionId]);

  const loadVocabulary = async () => {
    try {
      const response = await vocabularyService.getAll(1, 1000);
      setVocabularyList(response.data || []);

      // Auto-select recent 20-30 words by default
      autoSelectVocabulary(response.data || [], 'recent');
    } catch (error) {
      console.error('Error loading vocabulary:', error);
    }
  };

  const loadSessionVocabulary = async () => {
    try {
      const vocab = await chatService.getSessionVocabulary(currentSessionId);
      setSessionVocabulary(vocab || []);
    } catch (error) {
      console.error('Error loading session vocabulary:', error);
    }
  };

  const autoSelectVocabulary = (vocabList, mode) => {
    let selected = [];
    const sortedVocab = [...vocabList];

    if (mode === 'recent') {
      // Most recent 20-30 words
      sortedVocab.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      selected = sortedVocab.slice(0, Math.min(25, sortedVocab.length));
    } else if (mode === 'least-practiced') {
      // Least practiced words (lowest studiedCount)
      sortedVocab.sort((a, b) => a.studiedCount - b.studiedCount);
      selected = sortedVocab.slice(0, Math.min(25, sortedVocab.length));
    } else {
      // All words
      selected = sortedVocab;
    }

    setSelectedVocabIds(selected.map(v => v.id));
    setAutoSelectMode(mode);
  };

  const toggleVocabSelection = (vocabId) => {
    setSelectedVocabIds(prev =>
      prev.includes(vocabId)
        ? prev.filter(id => id !== vocabId)
        : [...prev, vocabId]
    );
  };

  const toggleWordReveal = (wordId) => {
    setRevealedWords(prev => {
      const next = new Set(prev);
      if (next.has(wordId)) {
        next.delete(wordId);
      } else {
        next.add(wordId);
      }
      return next;
    });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setError('');

    try {
      const response = await chatService.sendMessage(
        inputMessage,
        currentSessionId,
        selectedScenario !== 'free' ? SCENARIOS.find(s => s.id === selectedScenario)?.label : null,
        selectedVocabIds.length > 0 ? selectedVocabIds : null
      );

      if (!currentSessionId && response.session?.id) {
        setCurrentSessionId(response.session.id);
        setSessionVocabulary(vocabularyList.filter(v => selectedVocabIds.includes(v.id)));
      }

      // Update user message with grammar info
      const updatedUserMessage = {
        ...userMessage,
        hasGrammarError: response.userMessage.hasGrammarError,
        grammarCorrection: response.userMessage.grammarCorrection,
        grammarTips: response.userMessage.grammarTips,
      };

      const aiMessage = {
        role: 'assistant',
        content: response.aiMessage.content,
      };

      setMessages((prev) => {
        const withoutLast = prev.slice(0, -1);
        return [...withoutLast, updatedUserMessage, aiMessage];
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setError('');
    setSessionVocabulary([]);
    setRevealedWords(new Set());
    setShowCheatSheet(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${showCheatSheet ? 'mr-80' : ''}`}>
        <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 flex flex-col" style={{ height: '100vh' }}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>

            <div className="flex gap-2">
              {currentSessionId && (
                <button
                  onClick={() => setShowCheatSheet(!showCheatSheet)}
                  className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm flex items-center"
                >
                  {showCheatSheet ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  Cheat Sheet
                </button>
              )}
              <button
                onClick={startNewConversation}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                disabled={loading}
              >
                New Conversation
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 mr-3" />
              Conversation Practice 💬
            </h2>
            <p className="text-sm text-gray-600 mt-1">Practice Chinese in real-life scenarios</p>
          </div>

          {/* Scenario and Vocabulary Selection */}
          {!currentSessionId && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Choose a Scenario:</label>
                <select
                  value={selectedScenario}
                  onChange={(e) => setSelectedScenario(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SCENARIOS.map(scenario => (
                    <option key={scenario.id} value={scenario.id}>
                      {scenario.label} - {scenario.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Select Vocabulary ({selectedVocabIds.length} words):
                  </label>
                  <button
                    onClick={() => setShowVocabSelector(!showVocabSelector)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {showVocabSelector ? 'Hide' : 'Customize'}
                  </button>
                </div>

                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => autoSelectVocabulary(vocabularyList, 'recent')}
                    className={`px-3 py-1 text-xs rounded ${autoSelectMode === 'recent' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    Recent 25
                  </button>
                  <button
                    onClick={() => autoSelectVocabulary(vocabularyList, 'least-practiced')}
                    className={`px-3 py-1 text-xs rounded ${autoSelectMode === 'least-practiced' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    Least Practiced
                  </button>
                  <button
                    onClick={() => autoSelectVocabulary(vocabularyList, 'all')}
                    className={`px-3 py-1 text-xs rounded ${autoSelectMode === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    All Words
                  </button>
                </div>

                {showVocabSelector && (
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2">
                    {vocabularyList.map(vocab => (
                      <label key={vocab.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedVocabIds.includes(vocab.id)}
                          onChange={() => toggleVocabSelection(vocab.id)}
                          className="rounded"
                        />
                        <span className="font-bold">{vocab.chinese}</span>
                        <span className="text-gray-500">{vocab.pinyin}</span>
                        <span className="text-gray-700">- {vocab.english}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 bg-white rounded-lg shadow-xl p-4 overflow-y-auto mb-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <p className="text-lg mb-2">👋 Ready to practice?</p>
                <p className="text-sm">Choose a scenario and start chatting in Chinese!</p>
              </div>
            )}
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index}>
                  <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="whitespace-pre-line text-sm">{message.content}</p>
                    </div>
                  </div>

                  {/* Grammar Correction under user message */}
                  {message.role === 'user' && message.hasGrammarError !== undefined && (
                    <div className={`flex justify-end mt-1`}>
                      <div className="max-w-[85%] text-xs">
                        {message.hasGrammarError ? (
                          <div className="bg-red-50 border border-red-200 rounded p-2">
                            <div className="flex items-center gap-1 text-red-800 font-semibold mb-1">
                              <X className="w-3 h-3" />
                              <span>Grammar needs improvement</span>
                            </div>
                            {message.grammarCorrection && (
                              <p className="text-red-700 mb-1">
                                <strong>Correction:</strong> {message.grammarCorrection}
                              </p>
                            )}
                            {message.grammarTips && (
                              <p className="text-red-600 text-xs">{message.grammarTips}</p>
                            )}
                          </div>
                        ) : (
                          <div className="bg-green-50 border border-green-200 rounded p-2 flex items-center gap-1">
                            <Check className="w-3 h-3 text-green-600" />
                            <span className="text-green-800 font-semibold">Perfect! ✓</span>
                            {message.grammarTips && (
                              <span className="text-green-700 ml-2">{message.grammarTips}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin text-blue-600" />
                    <p className="text-gray-600 text-sm">AI is typing...</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="用中文打字... (Type in Chinese...)"
              className="flex-1 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || loading}
              className={`px-4 py-3 rounded-lg text-white text-sm font-semibold transition-all flex items-center ${
                !inputMessage.trim() || loading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
              }`}
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Vocabulary Cheat Sheet Sidebar */}
      {showCheatSheet && sessionVocabulary.length > 0 && (
        <div className="w-80 bg-white border-l border-gray-200 shadow-2xl overflow-y-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Vocabulary Cheat Sheet</h3>
            <button onClick={() => setShowCheatSheet(false)} className="text-gray-500 hover:text-gray-700">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-gray-600 mb-4">Click on a word to reveal its meaning</p>

          <div className="space-y-3">
            {sessionVocabulary.map(vocab => {
              const isRevealed = revealedWords.has(vocab.id);
              return (
                <div
                  key={vocab.id}
                  onClick={() => toggleWordReveal(vocab.id)}
                  className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="font-bold text-lg mb-1">{vocab.chinese}</div>
                  {isRevealed ? (
                    <>
                      <div className="text-sm text-gray-600 mb-1">{vocab.pinyin}</div>
                      <div className="text-sm text-gray-800">{vocab.english}</div>
                      {vocab.example && (
                        <div className="text-xs text-gray-500 mt-2 italic">{vocab.example}</div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-gray-400">Click to reveal</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Conversation;
