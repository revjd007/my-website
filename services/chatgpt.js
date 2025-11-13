const OpenAI = require('openai');

let chatgptInstance = null;

function setupChatGPT() {
  if (!chatgptInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenAI API key not found. ChatGPT features will be disabled.');
      return {
        getResponse: async (message) => {
          return 'ChatGPT is not configured. Please set OPENAI_API_KEY environment variable.';
        }
      };
    }

    chatgptInstance = new OpenAI({
      apiKey: apiKey
    });
  }

  return {
    getResponse: async (message) => {
      try {
        // Remove @ChatGPT mention
        const cleanMessage = message.replace(/@ChatGPT|@chatgpt/gi, '').trim();

        const completion = await chatgptInstance.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful AI assistant in a chat platform. Be concise and friendly."
            },
            {
              role: "user",
              content: cleanMessage
            }
          ],
          max_tokens: 150
        });

        return completion.choices[0].message.content;
      } catch (error) {
        console.error('OpenAI API error:', error);
        return 'Sorry, I encountered an error. Please try again later.';
      }
    }
  };
}

module.exports = { setupChatGPT };

