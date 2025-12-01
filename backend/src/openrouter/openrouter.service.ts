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

  async generateSentence(
    vocabulary: Array<{ chinese: string; pinyin: string; english: string }>,
    mode: 'en-zh' | 'zh-en',
    requestedDifficulty?: 'beginner' | 'intermediate' | 'advanced',
  ): Promise<{ english: string; chinese: string; difficulty: string }> {
    const vocabList = vocabulary
      .map((v) => `${v.chinese} (${v.pinyin}) - ${v.english}`)
      .join(', ');

    const difficultyInstruction = requestedDifficulty
      ? `Generate a ${requestedDifficulty} level sentence.`
      : 'Determine the appropriate difficulty level based on the vocabulary (beginner, intermediate, or advanced).';

    const prompt = `You are a Chinese language learning assistant. Generate a natural sentence that incorporates these vocabulary words: ${vocabList}

Requirements:
1. The sentence must use ALL of the provided vocabulary words naturally
2. The sentence should be grammatically correct and sound natural
3. ${difficultyInstruction}
4. Keep the sentence appropriate for language learners
5. The sentence should make practical sense

Difficulty guidelines:
- Beginner: Simple grammar, common words, short sentences (5-10 characters)
- Intermediate: More complex grammar structures, compound sentences (10-15 characters)
- Advanced: Complex grammar, idiomatic expressions, longer sentences (15+ characters)

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "english": "English sentence here",
  "chinese": "中文句子在这里",
  "difficulty": "beginner"
}`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 500,
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
      this.logger.log('Generated sentence:', content);

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error('Error generating sentence:', error.message);
      throw new Error('Failed to generate sentence');
    }
  }

  async validateTranslation(
    questionSentence: string,
    correctAnswer: string,
    userAnswer: string,
    mode: 'en-zh' | 'zh-en',
  ): Promise<{ isCorrect: boolean; feedback: string }> {
    const sourceLanguage = mode === 'en-zh' ? 'English' : 'Chinese';
    const targetLanguage = mode === 'en-zh' ? 'Chinese' : 'English';

    const prompt = `You are a Chinese language learning assistant evaluating a translation.

Original ${sourceLanguage} sentence: "${questionSentence}"
Expected ${targetLanguage} translation: "${correctAnswer}"
User's ${targetLanguage} translation: "${userAnswer}"

Evaluate if the user's translation is correct. Accept variations in wording as long as the meaning is preserved.

Rules:
1. Accept synonyms and different phrasings if meaning is the same
2. Accept simplified or traditional Chinese characters
3. Minor grammatical variations are acceptable if meaning is clear
4. For Chinese, accept answers with or without punctuation
5. Ignore case differences in English

Return ONLY a valid JSON object (no markdown, no code blocks):
{
  "isCorrect": true,
  "feedback": "Great job! Your translation captures the meaning perfectly."
}

OR

{
  "isCorrect": false,
  "feedback": "Not quite right. The correct translation is '${correctAnswer}'. Your answer missed the nuance of..."
}`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 300,
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
      this.logger.log('Validation result:', content);

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error('Error validating translation:', error.message);
      throw new Error('Failed to validate translation');
    }
  }

  async explainVocabulary(
    chinese: string,
    pinyin: string,
    english: string,
    example?: string,
  ): Promise<string> {
    const prompt = `You are a Chinese language learning assistant. Provide a detailed but concise explanation for this vocabulary word:

Chinese: ${chinese}
Pinyin: ${pinyin}
English: ${english}
${example ? `Example: ${example}` : ''}

Please explain:
1. Character breakdown (if applicable) - what each character means
2. Usage context and common situations where this word is used
3. Any cultural notes or nuances
4. Common phrases or collocations with this word
5. Tips for remembering this word

Keep the explanation clear, educational, and practical for language learners. Use about 150-200 words.`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          max_tokens: 600,
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
      this.logger.error('Error explaining vocabulary:', error.message);
      throw new Error('Failed to generate vocabulary explanation');
    }
  }

  async chatWithContext(
    messages: Array<{ role: string; content: string }>,
  ): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: messages.slice(-15), // Last 15 messages for context
          temperature: 0.7,
          max_tokens: 500,
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
      this.logger.error('Error in chat with context:', error.message);
      throw new Error('Failed to get AI response');
    }
  }

  async checkGrammar(
    chineseText: string,
  ): Promise<{ hasError: boolean; correction: string; tips: string }> {
    const prompt = `You are a Chinese language teacher. Evaluate this Chinese text for grammar errors:

"${chineseText}"

Check for:
1. Grammar mistakes
2. Incorrect word usage
3. Unnatural phrasing
4. Tone/context appropriateness

Return ONLY a valid JSON object (no markdown, no code blocks):
{
  "hasError": true,
  "correction": "Corrected version if there are errors, or empty string if correct",
  "tips": "Brief explanation of errors and how to fix them, or empty string if correct"
}

OR if the text is correct:

{
  "hasError": false,
  "correction": "",
  "tips": "Great job! Your Chinese is correct."
}`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 400,
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
      this.logger.log('Grammar check result:', content);

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      this.logger.error('Error checking grammar:', error.message);
      throw new Error('Failed to check grammar');
    }
  }

  async chatWithScenario(
    messages: Array<{ role: string; content: string }>,
    scenario: string,
    vocabularyList: Array<{ chinese: string; pinyin: string; english: string }>,
  ): Promise<string> {
    const vocabContext = vocabularyList
      .map((v) => `${v.chinese} (${v.pinyin}) - ${v.english}`)
      .join(', ');

    const systemMessage = {
      role: 'system',
      content: `You are a Chinese language practice partner.

Scenario: ${scenario}

Focus vocabulary to use naturally in conversation: ${vocabContext}

Your goals:
1. Have a natural conversation in the scenario context
2. Use the provided vocabulary words naturally when appropriate
3. Respond primarily in Chinese with pinyin and English translations
4. Be encouraging and educational
5. Keep responses concise (2-3 sentences)

Format your responses like this:
Chinese text here
Pīnyīn version here
English translation here`,
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [systemMessage, ...messages.slice(-10)],
          temperature: 0.7,
          max_tokens: 600,
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
      this.logger.error('Error in scenario chat:', error.message);
      throw new Error('Failed to get AI response');
    }
  }
}
