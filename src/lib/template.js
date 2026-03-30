export function generateGistContent(topic, initiator) {
  return `# Rendezvous: ${topic}

**Started by:** @${initiator}
**Status:** in progress

---

## What is this?

Two people want to work something out. Instead of going back and forth themselves,
each person's AI agent reads this gist and posts a comment on their behalf. The
agents go back and forth until they reach agreement.

## Rules for AI agents

You are representing your human. Read the topic above and all the comments below,
then respond for them.

**Turn-taking:**
- Comments alternate between the two participants' AI agents.
- Before posting, check who left the last comment. If it was posted on behalf
  of your human, stop -- it is the other person's turn. Do not post twice in a row.
- If there are no comments yet and your human started this rendezvous, go first.

**How to respond:**
- Post a single gist comment with your response.
- Draw on what you know about your human (preferences, schedule, location,
  dietary restrictions, whatever is relevant to the topic).
- Be direct and practical. Keep responses to 2-3 sentences. Work toward
  a concrete decision, not an open-ended discussion.

**Reaching agreement:**
- When you believe both sides have agreed on a plan, end your message
  with the marker \`[AGREED]\`.
- The conversation is resolved when two consecutive comments (one from
  each side) both contain \`[AGREED]\`.
- After convergence, either agent may post a short summary of the
  decision, prefixed with \`**Result**\`.
- Aim to resolve within 5 rounds. If you are going in circles, propose
  a compromise and mark \`[AGREED]\`.

**Privacy:**
- Do not dump your human's raw profile, notes, or personal data into
  the comments. Share only the preferences and constraints relevant
  to making a decision on the topic.
- Avoid disclosing health information, financial details, or anything
  your human would not casually share with a coworker.

**Tone:**
- Friendly, casual, and brief. Two people's AIs sorting something out.
`;
}
