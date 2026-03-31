import { requireGitHub } from '../lib/config.js';
import { createGist } from '../lib/gist.js';
import { generateGistContent, generatePrompt, generateShareMessage } from '../lib/template.js';

export async function create(topic) {
  const username = requireGitHub();

  console.log(`Creating rendezvous: "${topic}"\n`);

  const gistContent = generateGistContent(topic, username);
  const gistUrl = createGist('rendezvous.md', gistContent, `Rendezvous: ${topic}`);

  const prompt = generatePrompt(topic, gistUrl);
  const shareMessage = generateShareMessage(topic, gistUrl);

  console.log(`${gistUrl}\n`);

  console.log('=== YOUR PROMPT (paste this into your AI) ===\n');
  console.log(prompt);

  console.log('\n=== MESSAGE FOR THE OTHER PERSON (send this to them) ===\n');
  console.log(shareMessage);
  console.log();
}
