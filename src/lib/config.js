import { execSync } from 'node:child_process';

export function getGitHubUsername() {
  try {
    return execSync('gh api user --jq .login', { encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

export function requireGitHub() {
  const username = getGitHubUsername();
  if (!username) {
    console.error('GitHub CLI not authenticated. Run: gh auth login');
    process.exit(1);
  }
  return username;
}
