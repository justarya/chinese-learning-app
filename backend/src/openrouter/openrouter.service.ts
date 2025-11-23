import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl = 'https://openrouter.ai/api/v1';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get('OPENROUTER_API_KEY');
    this.model = this.configService.get('OPENROUTER_MODEL') || 'qwen/qwen-2.5-72b-instruct';
  }

  async convertNotesToVocabulary(notes: string): Promise<any[]> {
    const prompt = `You are a Chinese language learning assistant. Convert the following rough notes into structured vocabulary entries.

Rules:
1. Extract: Chinese characters, Pinyin, English translation, and example sentence
2. If pinyin is missing, generate it with proper tone marks (e.g., nǐ hǎo)
3. If example is missing, create a simple example sentence in Chinese using the vocabulary
4. Convert all non-English translations to English (e.g., Indonesian "pabrik" → "factory", "toko buah" → "fruit shop")
5. Normalize pinyin format to standard with tone marks
6. If Chinese characters are missing but pinyin is present, try to infer the characters
7. Each entry must have at minimum: chinese, pinyin, and english fields

Input notes:
${notes}

Return ONLY a valid JSON array with this exact structure (no markdown, no code blocks, just the JSON):
[
  {
    "chinese": "工厂",
    "pinyin": "gōngchǎng",
    "english": "factory",
    "example": "这是一个大工厂"
  }
]`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 4000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': this.configService.get('FRONTEND_URL'),
            'X-Title': 'Chinese Learning App',
          },
        },
      );

      const content = response.data.choices[0].message.content;
      this.logger.log('OpenRouter response:', content);

      // Parse JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        this.logger.error('No JSON array found in response');
        throw new Error('Invalid response format from AI');
      }

      const vocabularyList = JSON.parse(jsonMatch[0]);

      // Validate and filter results
      return vocabularyList.filter((item) => {
        return item.chinese && item.pinyin && item.english;
      });
    } catch (error) {
      this.logger.error('Error converting notes:', error.message);
      if (error.response) {
        this.logger.error('API Error:', error.response.data);
      }
      throw new Error('Failed to convert notes with AI');
    }
  }

  async chatWithAI(
    messages: Array<{ role: string; content: string }>,
  ): Promise<string> {
    const systemMessage = {
      role: 'system',
      content: `You are a helpful Chinese language practice partner. Your goals:
1. Respond primarily in Chinese for practice
2. Include pinyin (with tone marks) for all Chinese text
3. Include English translations for clarity
4. Be encouraging and educational
5. Correct mistakes gently
6. Keep responses concise but informative

Format your responses like this:
Chinese text here
Pīnyīn version here
English translation here`,
    };

    try {
      // Limit context to last 10 messages for cost and context management
      const contextMessages = messages.slice(-10);

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [systemMessage, ...contextMessages],
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': this.configService.get('FRONTEND_URL'),
            'X-Title': 'Chinese Learning App',
          },
        },
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      this.logger.error('Error in chat:', error.message);
      if (error.response) {
        this.logger.error('API Error:', error.response.data);
      }
      throw new Error('Failed to get AI response');
    }
  }

  async explainGrammar(chineseText: string): Promise<string> {
    const prompt = `Provide a word-by-word breakdown and grammar explanation for this Chinese text: "${chineseText}"

Please explain:
1. Each character/word and its meaning
2. The grammar structure
3. How the parts fit together
4. Any cultural or usage notes

Keep it concise and educational.`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.5,
          max_tokens: 800,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': this.configService.get('FRONTEND_URL'),
            'X-Title': 'Chinese Learning App',
          },
        },
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      this.logger.error('Error explaining grammar:', error.message);
      throw new Error('Failed to get grammar explanation');
    }
  }
}
