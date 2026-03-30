export async function chat(messages, config) {
  const { provider, model, apiKey } = config.llm;

  switch (provider) {
    case 'openai':
      return chatOpenAI(messages, model, apiKey);
    case 'anthropic':
      return chatAnthropic(messages, model, apiKey);
    case 'ollama':
      return chatOllama(messages, model);
    default:
      throw new Error(`Unknown LLM provider: ${provider}`);
  }
}

async function chatOpenAI(messages, model, apiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.7 }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function chatAnthropic(messages, model, apiKey) {
  const systemMsg = messages.find((m) => m.role === 'system');
  const otherMsgs = messages.filter((m) => m.role !== 'system');

  const body = {
    model: model || 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: otherMsgs,
  };
  if (systemMsg) {
    body.system = systemMsg.content;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function chatOllama(messages, model) {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: model || 'llama3', messages, stream: false }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Ollama error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.message.content;
}
