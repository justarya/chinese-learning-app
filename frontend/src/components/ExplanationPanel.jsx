import { useState, useEffect, useRef } from 'react';
import { X, Send, Loader, MessageCircle } from 'lucide-react';
import api from '../services/api';
import MarkdownRenderer from './MarkdownRenderer';

function ExplanationPanel({ vocabularyId, onClose }) {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    loadExplanation();
  }, [vocabularyId]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadExplanation = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/vocabulary/explanation/${vocabularyId}`);
      setExplanation(response.data);
      setChatHistory(response.data.chatHistory || []);
    } catch (error) {
      console.error('Error loading explanation:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatMessage.trim() || sendingMessage) return;

    const userMessage = chatMessage.trim();
    setChatMessage('');
    setSendingMessage(true);

    // Optimistically add user message
    const newHistory = [...chatHistory, { role: 'user', content: userMessage }];
    setChatHistory(newHistory);

    try {
      const response = await api.post(`/api/vocabulary/explanation/${vocabularyId}/chat`, {
        message: userMessage,
      });

      setChatHistory(response.data.chatHistory);
    } catch (error) {
      console.error('Error sending message:', error);
      // Revert on error
      setChatHistory(chatHistory);
    } finally {
      setSendingMessage(false);
    }
  };

  if (!vocabularyId) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sm:p-6 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold">Vocabulary Explanation</h2>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-blue-700 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
        ) : explanation ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Vocabulary Info */}
            <div className="bg-blue-50 rounded-lg p-4 sm:p-6 mb-6">
              <div className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                {explanation.vocabulary.chinese}
              </div>
              <div className="text-xl sm:text-2xl text-gray-600 mb-2">
                {explanation.vocabulary.pinyin}
              </div>
              <div className="text-lg sm:text-xl text-gray-700">
                {explanation.vocabulary.english}
              </div>
              {explanation.vocabulary.example && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Example:</p>
                  <p className="text-base text-gray-700 italic">
                    {explanation.vocabulary.example}
                  </p>
                </div>
              )}
            </div>

            {/* AI Explanation */}
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                Detailed Explanation
              </h3>
              <div className="text-gray-700 leading-relaxed">
                <MarkdownRenderer content={explanation.explanation} />
              </div>
            </div>

            {/* Chat History */}
            {chatHistory.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Questions & Answers</h3>
                <div className="space-y-3">
                  {chatHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-3 ${
                          msg.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <p className="text-sm whitespace-pre-line">{msg.content}</p>
                        ) : (
                          <div className="text-sm">
                            <MarkdownRenderer content={msg.content} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-600">Failed to load explanation</p>
          </div>
        )}

        {/* Chat Input - Fixed at Bottom */}
        {!loading && explanation && (
          <div className="border-t border-gray-200 p-4 bg-white">
            <p className="text-xs text-gray-500 mb-2">Ask a question about this word:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                placeholder="Type your question..."
                className="flex-1 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={sendingMessage}
              />
              <button
                onClick={sendChatMessage}
                disabled={!chatMessage.trim() || sendingMessage}
                className={`px-4 py-3 rounded-lg text-white transition-all flex items-center justify-center ${
                  !chatMessage.trim() || sendingMessage
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {sendingMessage ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ExplanationPanel;
