import { requireSetup } from '../lib/config.js';
import { parseGistUrl, getGist, getGistComments, getGistTopic } from '../lib/gist.js';
import { poll, generateResponse } from '../lib/conversation.js';
import { postGistCommentRaw } from '../lib/gist.js';

export async function join(gistUrl) {
  const { config, profile, username } = requireSetup();
  const gistId = parseGistUrl(gistUrl);

  console.log('Joining rendezvous...');

  // Read the gist and current state
  const gist = getGist(gistId);
  const topic = getGistTopic(gist);
  const comments = getGistComments(gistId);

  console.log(`Topic: "${topic}"`);
  console.log(`${comments.length} message(s) so far.\n`);

  // Show conversation so far
  for (const c of comments) {
    console.log(`  @${c.user}: ${c.body.slice(0, 100)}${c.body.length > 100 ? '...' : ''}`);
  }
  console.log('');

  // Post our first response if it's our turn
  const lastComment = comments[comments.length - 1];
  if (lastComment && lastComment.user !== username) {
    console.log('Generating response...');
    const response = await generateResponse(comments, username, profile, topic, config);
    postGistCommentRaw(gistId, response);
    console.log(`Your agent said:\n  "${response}"\n`);
  }

  // Start polling for the rest of the conversation
  console.log('Continuing conversation...\n');
  await poll(gistId, config, profile, username);
}
