import { requireGitHub } from '../lib/config.js';
import { createGist } from '../lib/gist.js';
import { generateGistContent } from '../lib/template.js';

export async function create(topic, options) {
  const username = requireGitHub();
  const invitee = options.with || '';

  console.log(`Creating rendezvous: "${topic}"`);
  if (invitee) console.log(`Inviting: @${invitee}`);

  const gistContent = generateGistContent(topic, username, invitee);
  const gistUrl = createGist('rendezvous.md', gistContent, `Rendezvous: ${topic}`);

  console.log(`\n${gistUrl}\n`);
  console.log('Share that link with the other person. Then both of you tell');
  console.log('your AI to go to that URL and respond on your behalf.');
}
