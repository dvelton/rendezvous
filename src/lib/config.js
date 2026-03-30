import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline';

const CONFIG_DIR = join(homedir(), '.rendezvous');
const CONFIG_PATH = join(CONFIG_DIR, 'config.json');
const PROFILE_PATH = join(CONFIG_DIR, 'profile.md');

const DEFAULT_CONFIG = {
  llm: {
    provider: 'openai',
    model: 'gpt-4o',
    apiKey: '',
  },
  defaults: {
    maxRounds: 5,
    pollInterval: 3000,
  },
};

export function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function getConfig() {
  if (!existsSync(CONFIG_PATH)) {
    return null;
  }
  return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
}

export function saveConfig(config) {
  ensureConfigDir();
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
}

export function getProfile() {
  if (!existsSync(PROFILE_PATH)) {
    return null;
  }
  return readFileSync(PROFILE_PATH, 'utf-8');
}

export function saveProfile(content) {
  ensureConfigDir();
  writeFileSync(PROFILE_PATH, content);
}

export function getGitHubUsername() {
  try {
    return execSync('gh api user --jq .login', { encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

export function requireSetup() {
  const config = getConfig();
  const profile = getProfile();

  if (!config || !config.llm?.apiKey) {
    console.error('Not set up yet. Run: rendezvous init');
    process.exit(1);
  }
  if (!profile) {
    console.error('No profile found. Run: rendezvous init');
    process.exit(1);
  }

  const username = getGitHubUsername();
  if (!username) {
    console.error('GitHub CLI not authenticated. Run: gh auth login');
    process.exit(1);
  }

  return { config, profile, username };
}

export function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export { CONFIG_DIR, CONFIG_PATH, PROFILE_PATH, DEFAULT_CONFIG };
