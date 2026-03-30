import { requireSetup } from '../lib/config.js';
import { createGist } from '../lib/gist.js';
import { parseGistUrl } from '../lib/gist.js';
import { generateGistContent } from '../lib/template.js';
import { generateResponse, poll } from '../lib/conversation.js';
import { postGistCommentRaw, getGistComments } from '../lib/gist.js';

export async function create(topic, options) {
  const { config, profile, username } = requireSetup();
  const invitee = options.with || '';

  console.log(`Creating rendezvous: "${topic}"`);
  if (invitee) console.log(`Inviting: @${invitee}`);

  // Create the gist
  const gistContent = generateGistContent(topic, username, invitee);
  const gistUrl = createGist('rendezvous.md', gistContent, `Rendezvous: ${topic}`);
  const gistId = parseGistUrl(gistUrl);

  console.log(`\nGist created: ${gistUrl}`);

  // Generate and post the opening message
  console.log('Generating opening message...');
  const openingMessages = [
    {
      role: 'system',
      content: `You are acting as a personal representative for your human in a casual conversation with another person's AI agent. Your goal is to reach a mutually agreeable decision.

Your human's preferences and context:
---
${profile}
---

Topic: ${topic}

This is your opening message. Introduce the topic, share relevant preferences (without oversharing private details), and suggest an initial direction. Be friendly and concise -- 2-3 sentences.`,
    },
    {
      role: 'user',
      content: `Start the conversation about: ${topic}`,
    },
  ];

  const { chat } = await import('../lib/llm.js');
  const opening = await chat(openingMessages, config);
  postGistCommentRaw(gistId, opening);
  console.log(`\nOpening posted. Your agent said:\n  "${opening}"\n`);

  // Share instructions
  console.log('Share this link with the other person:');
  console.log(`\n  ${gistUrl}\n`);
  console.log('They can join by running:');
  console.log(`  rendezvous join ${gistUrl}\n`);
  console.log('Or by telling their AI tool:');
  console.log(`  "Go to ${gistUrl} and respond on my behalf"\n`);

  // Start polling
  if (options.poll !== false) {
    console.log('Waiting for a response...\n');
    await poll(gistId, config, profile, username);
  }
}
