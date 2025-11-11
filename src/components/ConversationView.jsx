import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Send, MessageCircle, HelpCircle, X } from 'lucide-react'

function ConversationView({ navigateTo }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '你好！我是你的中文练习伙伴。我们可以用中文聊天，我会帮助你练习。\n\nNǐ hǎo! Wǒ shì nǐ de zhōngwén liànxí huǒbàn. Wǒmen kěyǐ yòng zhōngwén liáotiān, wǒ huì bāngzhù nǐ liànxí.\n\nHello! I\'m your Chinese practice partner. We can chat in Chinese, and I\'ll help you practice.'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [explanation, setExplanation] = useState(null)
  const [loadingExplanation, setLoadingExplanation] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, explanation])

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return

    const userMessage = {
      role: 'user',
      content: inputMessage
    }

    setMessages([...messages, userMessage])
    setInputMessage('')
    setLoading(true)

    try {
      // Simulated AI response - In production, this would call the Anthropic API
      // The response should be in Chinese with pinyin and English translation
      const mockResponse = generateMockResponse(inputMessage)

      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: mockResponse
        }])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，我现在无法回复。Bàoqiàn, wǒ xiànzài wúfǎ huífù. Sorry, I cannot respond right now.'
      }])
      setLoading(false)
    }
  }

  const generateMockResponse = (userInput) => {
    // Simple mock responses based on common patterns
    const lowerInput = userInput.toLowerCase()

    if (lowerInput.includes('你好') || lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return '你好！很高兴见到你！\n\nNǐ hǎo! Hěn gāoxìng jiàn dào nǐ!\n\nHello! Very happy to meet you!'
    }

    if (lowerInput.includes('学习') || lowerInput.includes('study') || lowerInput.includes('learn')) {
      return '学习中文很有趣！你想练习什么？\n\nXuéxí zhōngwén hěn yǒuqù! Nǐ xiǎng liànxí shénme?\n\nLearning Chinese is very interesting! What do you want to practice?'
    }

    if (lowerInput.includes('谢谢') || lowerInput.includes('thank')) {
      return '不客气！继续加油！\n\nBù kèqì! Jìxù jiāyóu!\n\nYou\'re welcome! Keep up the good work!'
    }

    return '很好！继续练习。你还想说什么？\n\nHěn hǎo! Jìxù liànxí. Nǐ hái xiǎng shuō shénme?\n\nVery good! Keep practicing. What else would you like to say?'
  }

  const explainMessage = async (messageContent) => {
    setLoadingExplanation(true)
    setExplanation({ content: messageContent, text: '' })

    try {
      // Simulated explanation - In production, this would call the Anthropic API
      const mockExplanation = generateMockExplanation(messageContent)

      setTimeout(() => {
        setExplanation({ content: messageContent, text: mockExplanation })
        setLoadingExplanation(false)
      }, 800)
    } catch (error) {
      setExplanation({ content: messageContent, text: 'Could not generate explanation.' })
      setLoadingExplanation(false)
    }
  }

  const generateMockExplanation = (text) => {
    // Extract Chinese characters and provide basic breakdown
    const chineseChars = text.match(/[\u4e00-\u9fa5]+/g)

    if (!chineseChars || chineseChars.length === 0) {
      return 'This message contains English text for explanation purposes.'
    }

    return `Breaking down the Chinese in this message:\n\n` +
      `The text contains these Chinese characters/words: ${chineseChars.join(', ')}\n\n` +
      `Each character or word contributes to the overall meaning of the sentence. ` +
      `Chinese sentences are built by combining characters that can function as words on their own or as parts of compound words.`
  }

  return (
    <div className="max-w-4xl mx-auto p-6 h-screen flex flex-col">
      <button
        onClick={() => navigateTo('home')}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Home
      </button>

      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center">
          <MessageCircle className="w-8 h-8 mr-3" />
          Chat in Chinese 💬
        </h2>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-xl p-6 mb-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-line">{message.content}</p>
                {message.role === 'assistant' && (
                  <button
                    onClick={() => explainMessage(message.content)}
                    className="mt-2 text-sm flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 mr-1" />
                    Explain this
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="text-gray-600">Typing...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {explanation && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-purple-900 flex items-center">
              <HelpCircle className="w-5 h-5 mr-2" />
              AI Explanation:
            </h3>
            <button
              onClick={() => setExplanation(null)}
              className="text-purple-600 hover:text-purple-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {loadingExplanation ? (
            <p className="text-gray-600">Generating explanation...</p>
          ) : (
            <p className="text-gray-700 whitespace-pre-line">{explanation.text}</p>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="用中文打字... (Type in Chinese...)"
          className="flex-1 border border-gray-300 rounded-lg p-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={!inputMessage.trim() || loading}
          className={`px-6 py-4 rounded-lg text-white text-lg font-semibold transition-all transform hover:scale-105 flex items-center ${
            !inputMessage.trim() || loading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
          }`}
        >
          <Send className="w-5 h-5 mr-2" />
          Send
        </button>
      </div>
    </div>
  )
}

export default ConversationView
