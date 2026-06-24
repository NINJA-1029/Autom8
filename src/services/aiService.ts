export interface AIModelConfig {
  apiKey: string;
  provider: 'openai' | 'anthropic' | 'gemini';
  explanationMode: 'concise' | 'standard' | 'detailed';
}

export async function askAITutor(
  config: AIModelConfig,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const { apiKey, provider, explanationMode } = config;
  if (!apiKey) {
    throw new Error('API key is missing. Please set it in Settings.');
  }

  const modeInstructions = {
    concise: 'Explain very briefly (1-2 sentences max).',
    standard: 'Provide a clear, pedagogical explanation.',
    detailed: 'Provide an in-depth explanation with step-by-step mathematical reasoning.'
  }[explanationMode];

  const fullSystemPrompt = `${systemPrompt}\n\nExplanation Mode Selected: ${explanationMode}. ${modeInstructions}`;

  try {
    if (provider === 'gemini') {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: `${fullSystemPrompt}\n\nUser Request: ${userMessage}` }] }
            ]
          })
        }
      );
      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        return data.candidates[0].content.parts[0].text;
      }
      throw new Error(data.error?.message || 'Invalid API Response from Gemini.');
    } 

    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: fullSystemPrompt },
            { role: 'user', content: userMessage }
          ]
        })
      });
      const data = await response.json();
      if (data.choices && data.choices[0].message.content) {
        return data.choices[0].message.content;
      }
      throw new Error(data.error?.message || 'Invalid API Response from OpenAI.');
    }

    if (provider === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'dangerously-allow-browser': 'true'
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 1024,
          system: fullSystemPrompt,
          messages: [{ role: 'user', content: userMessage }]
        })
      });
      const data = await response.json();
      if (data.content && data.content[0].text) {
        return data.content[0].text;
      }
      throw new Error(data.error?.message || 'Invalid API Response from Anthropic.');
    }

    throw new Error('Unsupported AI Provider.');
  } catch (error: any) {
    return `AI Tutor Error: ${error.message || error}`;
  }
}
