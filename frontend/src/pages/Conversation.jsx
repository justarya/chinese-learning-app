import { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Send, MessageCircle, Loader } from 'lucide-react';
import { chatService } from '../services/chat.service';

function Conversation() {
  const { sessionId } = useParams();
  const [currentSessionId, setCurrentSessionId] = useState(sessionId || null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content:
          '你好！我是你的中文练习伙伴。我们可以用中文聊天，我会帮助你练习。\n\nNǐ hǎo! Wǒ shì nǐ de zhōngwén liànxí huǒbàn. Wǒmen kěyǐ yòng zhōngwén liáotiān, wǒ huì bāngzhù nǐ liànxí.\n\nHello! I\'m your Chinese practice partner. We can chat in Chinese, and I\'ll help you practice.',
      },
    ]);
  }, []);

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
      const response = await chatService.sendMessage(inputMessage, currentSessionId);

      if (!currentSessionId && response.userMessage?.sessionId) {
        setCurrentSessionId(response.userMessage.sessionId);
      }

      const aiMessage = {
        role: 'assistant',
        content: response.aiMessage.content,
      };

      setMessages((prev) => [...prev, aiMessage]);
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
    setMessages([
      {
        role: 'assistant',
        content:
          '你好！我们开始新的对话吧！\n\nNǐ hǎo! Wǒmen kāishǐ xīn de duìhuà ba!\n\nHello! Let\'s start a new conversation!',
      },
    ]);
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 flex flex-col" style={{ height: 'calc(100vh - 60px)' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        <button
          onClick={startNewConversation}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
          disabled={loading}
        >
          New Conversation
        </button>
      </div>

      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center">
          <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 mr-3" />
          Chat in Chinese 💬
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Practice Chinese with AI-powered conversation</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 bg-white rounded-lg shadow-xl p-4 sm:p-6 mb-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-3 sm:p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-line text-sm sm:text-base">{message.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 sm:p-4 flex items-center gap-2">
                <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-600" />
                <p className="text-gray-600 text-sm sm:text-base">AI is typing...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex gap-2 sm:gap-3">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="用中文打字... (Type in Chinese...)"
          className="flex-1 border border-gray-300 rounded-lg p-3 sm:p-4 text-sm sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={!inputMessage.trim() || loading}
          className={`px-4 sm:px-6 py-3 sm:py-4 rounded-lg text-white text-sm sm:text-lg font-semibold transition-all transform hover:scale-105 flex items-center ${
            !inputMessage.trim() || loading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
          }`}
        >
          {loading ? (
            <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
              <span className="hidden sm:inline">Send</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-3 sm:mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-blue-800">
          <strong>Tip:</strong> Type in Chinese to practice! The AI will respond with Chinese text, pinyin, and English translations to help you learn.
        </p>
      </div>
    </div>
  );
}

export default Conversation;
