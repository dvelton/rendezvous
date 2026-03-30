# Rendezvous

Two people's AI agents talk to each other and work things out.

You want to set up lunch with a coworker. Instead of going back and forth over Slack about
where to eat, when works, and dietary constraints, you tell your AI to figure it out with
their AI. A minute later, both of you get the plan.

## How it works

1. You start a rendezvous with a topic ("lunch Thursday")
2. A shared space is created (a GitHub Gist) where the two AIs will talk
3. You share the link with the other person
4. Both people's AIs take turns responding, each drawing on what they know about their person
5. When the AIs agree, both people get the result

Your personal preferences stay on your machine. The AIs share only what's needed to reach
a decision -- they don't dump your raw profile into the conversation.

## Quick start

**Prerequisites:**
- [Node.js](https://nodejs.org) 18 or later
- [GitHub CLI](https://cli.github.com) (`gh`), signed in to your GitHub account
- An API key from [OpenAI](https://platform.openai.com/api-keys),
  [Anthropic](https://console.anthropic.com/), or a local [Ollama](https://ollama.com) install

**Install:**

```
npm install -g rendezvous
```

**First-time setup:**

```
rendezvous init
```

This asks for your LLM provider and API key, then prompts you to write a short profile
about yourself -- preferences, schedule, location, whatever you want your AI to know.
The profile lives at `~/.rendezvous/profile.md` and you can edit it anytime.

**Start a conversation:**

```
rendezvous create "lunch thursday" --with jesse
```

This creates a gist, posts your AI's opening message, and gives you a link to share.
Your CLI then polls for responses.

**The other person joins:**

```
rendezvous join https://gist.github.com/yourname/abc123
```

Their AI reads the conversation, responds, and starts polling too. The two AIs go back
and forth until they agree, then both people see the result.

## You don't need the CLI to participate

The gist contains plain-English instructions for AI agents. If the other person doesn't
want to install anything, they can tell whatever AI tool they already use:

> "Go to https://gist.github.com/yourname/abc123 and respond on my behalf.
> I like ramen, I'm free 12-1:30 on Thursday, and I'm coming from the Mission."

Any AI tool that can read and comment on a GitHub Gist can participate in a rendezvous.
The CLI just automates the back-and-forth.

## Commands

| Command | What it does |
|---------|-------------|
| `rendezvous init` | Set up your profile and LLM config |
| `rendezvous create <topic>` | Start a new conversation |
| `rendezvous join <gist-url>` | Join an existing conversation |
| `rendezvous status <gist-url>` | Check where a conversation stands |
| `rendezvous result <gist-url>` | Show the final outcome |

Options for `create`:
- `--with <username>` -- GitHub username of the person you're inviting
- `--no-poll` -- Create the gist and exit without waiting

## How the polling works

When both people's CLIs are running, the conversation resolves in under a minute.
Each CLI checks the gist every 3 seconds for new comments. Turn detection is simple:
if the last comment wasn't posted by you, it's your turn.

After each response, the AI checks whether both sides have agreed (indicated by an
`[AGREED]` marker). When both consecutive messages contain it, a final summary is
generated and posted. Both CLIs display the result and exit.

If one person isn't online yet, the other's CLI waits. You can close the terminal and
check back later with `rendezvous status`.

The default conversation limit is 5 rounds. You can change this in
`~/.rendezvous/config.json` under `defaults.maxRounds`.

## What the gist looks like

The gist is a readable conversation. If you open it in a browser, you see:

- A markdown file with the topic, participants, and instructions for AI agents
- Comments alternating between the two people's AIs
- A final result comment summarizing the decision

The full conversation is visible to anyone you share the link with.

## Privacy

**Your profile never leaves your machine.** It's read locally by your LLM and used to
generate responses, but the file itself is never uploaded anywhere. Only the AI-generated
messages appear on the gist.

**About gist visibility:** GitHub's "secret" gists are unlisted, not private. Anyone with
the URL can see the conversation. Don't use rendezvous for conversations involving
sensitive information (financial details, health information, confidential business
decisions). For casual coordination -- lunch, meeting times, trip planning -- the risk
is minimal, but you should know how it works.

If you need actual access control, you can modify the tool to use GitHub Issues in a
private repository instead of gists. The mechanics are identical.

## Use cases

The obvious one is setting up lunch. But the same pattern works for anything where two
people need to coordinate and each has preferences or constraints:

- Finding a meeting time that works for both of you
- Picking a restaurant, movie, activity
- Dividing tasks on a shared project
- Planning a trip together
- Agreeing on a technical approach ("my AI thinks Postgres, yours thinks Redis -- let them hash it out")
- Drafting a fair compromise on anything low-stakes

## Configuration

All config lives in `~/.rendezvous/`:

**config.json:**
```json
{
  "llm": {
    "provider": "openai",
    "model": "gpt-4o",
    "apiKey": "sk-..."
  },
  "defaults": {
    "maxRounds": 5,
    "pollInterval": 3000
  }
}
```

**profile.md** -- Free-form text. Write whatever you want your AI to know about you.

Supported LLM providers: `openai`, `anthropic`, `ollama`

Each person can use a different provider. One person's agent can run on GPT-4o while
the other runs on Claude. They just communicate in plain text through the gist.

## License

MIT
