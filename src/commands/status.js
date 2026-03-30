import { parseGistUrl, getGist, getGistComments, getGistTopic } from '../lib/gist.js';
import { hasConverged, roundCount } from '../lib/conversation.js';
import { requireGitHub } from '../lib/config.js';

export async function status(gistUrl) {
  const gistId = parseGistUrl(gistUrl);
  const username = requireGitHub();

  const gist = getGist(gistId);
  const topic = getGistTopic(gist);
  const comments = getGistComments(gistId);

  console.log(`Rendezvous: "${topic}"`);
  console.log(`Rounds: ${roundCount(comments)}`);
  console.log(`Messages: ${comments.length}`);

  if (comments.length === 0) {
    console.log('Status: waiting for first message');
    return;
  }

  const resultComment = comments.find((c) =>
    c.body.startsWith('**Result')
  );

  if (resultComment) {
    console.log('Status: complete\n');
    console.log(resultComment.body);
    return;
  }

  if (hasConverged(comments)) {
    console.log('Status: agreed\n');
  } else {
    const lastUser = comments[comments.length - 1].user;
    const waiting = lastUser === username ? 'the other person' : 'you';
    console.log(`Status: in progress (waiting for ${waiting})\n`);
  }

  console.log('Conversation:');
  for (const c of comments) {
    console.log(`\n  @${c.user}:`);
    console.log(`  ${c.body}`);
  }
}

export async function result(gistUrl) {
  const gistId = parseGistUrl(gistUrl);
  const gist = getGist(gistId);
  const topic = getGistTopic(gist);
  const comments = getGistComments(gistId);

  const resultComment = comments.find((c) =>
    c.body.startsWith('**Result')
  );

  if (resultComment) {
    const body = resultComment.body
      .replace(/^\*\*Result\*\*\n*/, '')
      .trim();
    console.log(`Rendezvous: "${topic}"\n`);
    console.log(body);
  } else {
    console.log(`Rendezvous: "${topic}"`);
    console.log('No result yet. The conversation is still in progress.');
  }
}
