import { getGistComments, postGistCommentRaw, getGist, getGistTopic } from './gist.js';
import { chat } from './llm.js';

export function isMyTurn(comments, myUsername) {
  if (comments.length === 0) return false;
  const lastComment = comments[comments.length - 1];
  return lastComment.user !== myUsername;
}

export function hasConverged(comments) {
  if (comments.length < 2) return false;
  const last = comments[comments.length - 1].body;
  const secondLast = comments[comments.length - 2].body;
  return last.includes('[AGREED]') && secondLast.includes('[AGREED]');
}

export function roundCount(comments) {
  return Math.floor(comments.length / 2);
}

function buildSystemPrompt(profile, topic) {
  return `You are acting as a personal representative for your human in a casual conversation with another person's AI agent. Your goal is to reach a mutually agreeable decision.

Your human's preferences and context:
---
${profile}
---

Topic: ${topic}

Guidelines:
- Be friendly, concise, and practical
- Factor in your human's preferences without revealing private details they wouldn't share
- Work toward a concrete decision
- When you believe you've reached agreement with the other agent, end your message with [AGREED]
- Keep responses to 2-3 sentences unless more detail is genuinely needed
- This is casual -- two people's AIs figuring something out together`;
}

function buildMessages(comments, myUsername, profile, topic) {
  const systemPrompt = buildSystemPrompt(profile, topic);
  const messages = [{ role: 'system', content: systemPrompt }];

  for (const comment of comments) {
    messages.push({
      role: comment.user === myUsername ? 'assistant' : 'user',
      content: comment.body,
    });
  }

  return messages;
}

export async function generateResponse(comments, myUsername, profile, topic, config) {
  const messages = buildMessages(comments, myUsername, profile, topic);
  return chat(messages, config);
}

export async function generateSynthesis(comments, topic, config) {
  const transcript = comments
    .map((c) => `@${c.user}: ${c.body}`)
    .join('\n\n');

  const messages = [
    {
      role: 'system',
      content: 'You are summarizing the outcome of a conversation between two people\'s AI agents. Produce a short, clear, actionable result. No preamble, no commentary -- just the decision.',
    },
    {
      role: 'user',
      content: `Topic: ${topic}\n\nConversation:\n${transcript}\n\nSummarize the agreed-upon decision in 2-3 sentences.`,
    },
  ];

  return chat(messages, config);
}

export async function poll(gistId, config, profile, username, { onTurn, onWait, onResult } = {}) {
  const gist = getGist(gistId);
  const topic = getGistTopic(gist);
  const maxRounds = config.defaults?.maxRounds || 5;
  const interval = config.defaults?.pollInterval || 3000;

  const log = (msg) => process.stderr.write(msg + '\n');

  while (true) {
    const comments = getGistComments(gistId);

    if (hasConverged(comments)) {
      log('Both agents agreed. Generating result...');
      const result = await generateSynthesis(comments, topic, config);
      const resultComment = `**Result**\n\n${result}`;
      postGistCommentRaw(gistId, resultComment);
      if (onResult) onResult(result);
      else log(`\n${'='.repeat(50)}\n${result}\n${'='.repeat(50)}`);
      return result;
    }

    if (roundCount(comments) >= maxRounds) {
      log(`Reached ${maxRounds} rounds. Generating result from current state...`);
      const result = await generateSynthesis(comments, topic, config);
      const resultComment = `**Result (max rounds reached)**\n\n${result}`;
      postGistCommentRaw(gistId, resultComment);
      if (onResult) onResult(result);
      else log(`\n${'='.repeat(50)}\n${result}\n${'='.repeat(50)}`);
      return result;
    }

    if (isMyTurn(comments, username)) {
      const round = roundCount(comments) + 1;
      if (onTurn) onTurn(round);
      else log(`Round ${round} -- generating response...`);

      const response = await generateResponse(comments, username, profile, topic, config);
      postGistCommentRaw(gistId, response);

      if (onTurn) onTurn(round, response);
      else log(`  Posted response.`);
    } else {
      if (onWait) onWait();
      else process.stderr.write('.');
    }

    await sleep(interval);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
