import { existsSync, readFileSync } from 'node:fs';
import {
  getConfig, saveConfig, getProfile, saveProfile,
  prompt, ensureConfigDir, CONFIG_DIR, PROFILE_PATH, DEFAULT_CONFIG,
} from '../lib/config.js';

export async function init() {
  ensureConfigDir();
  console.log('Setting up Rendezvous.\n');

  const existing = getConfig();

  // LLM provider
  console.log('LLM provider options: openai, anthropic, ollama');
  const provider = await prompt(
    `LLM provider [${existing?.llm?.provider || 'openai'}]: `
  ) || existing?.llm?.provider || 'openai';

  // Model
  const defaultModel = provider === 'openai' ? 'gpt-4o'
    : provider === 'anthropic' ? 'claude-sonnet-4-20250514'
    : 'llama3';
  const model = await prompt(
    `Model [${existing?.llm?.model || defaultModel}]: `
  ) || existing?.llm?.model || defaultModel;

  // API key
  let apiKey = existing?.llm?.apiKey || '';
  if (provider !== 'ollama') {
    const masked = apiKey ? `${apiKey.slice(0, 8)}...` : '(not set)';
    const newKey = await prompt(`API key [${masked}]: `);
    if (newKey) apiKey = newKey;
  }

  const config = {
    llm: { provider, model, apiKey },
    defaults: existing?.defaults || DEFAULT_CONFIG.defaults,
  };
  saveConfig(config);
  console.log(`\nConfig saved to ${CONFIG_DIR}/config.json`);

  // Profile
  const existingProfile = getProfile();
  if (existingProfile) {
    console.log(`\nProfile already exists at ${PROFILE_PATH}`);
    console.log('Current contents:\n');
    console.log(existingProfile);
    const edit = await prompt('Replace it? (y/N): ');
    if (edit.toLowerCase() !== 'y') {
      console.log('\nSetup complete.');
      return;
    }
  }

  console.log('\nWrite a short profile about yourself. This is what your AI');
  console.log('will use to represent you. Just describe your preferences,');
  console.log('schedule, location -- whatever is relevant. Examples:\n');
  console.log('  I like spicy food. Vegetarian on weekdays.');
  console.log('  I\'m in Hayes Valley SF.');
  console.log('  I usually have meetings 10-12 and 2-4.');
  console.log('  I prefer casual spots over fancy restaurants.\n');
  console.log('Enter your profile (press Enter twice to finish):\n');

  const lines = [];
  let emptyCount = 0;
  while (true) {
    const line = await prompt('');
    if (line === '') {
      emptyCount++;
      if (emptyCount >= 1 && lines.length > 0) break;
    } else {
      emptyCount = 0;
      lines.push(line);
    }
  }

  const profileContent = lines.join('\n') + '\n';
  saveProfile(profileContent);
  console.log(`\nProfile saved to ${PROFILE_PATH}`);
  console.log('Setup complete. You can edit your profile anytime at that path.');
}
