import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

export function run() {
  const program = new Command();

  program
    .name('rendezvous')
    .description('Let two people\'s AI agents talk to each other and work things out.')
    .version(pkg.version);

  program
    .command('init')
    .description('Set up your profile and LLM configuration')
    .action(async () => {
      const { init } = await import('./commands/init.js');
      await init();
    });

  program
    .command('create')
    .description('Start a new rendezvous conversation')
    .argument('<topic>', 'What the conversation is about (e.g. "lunch thursday")')
    .option('--with <username>', 'GitHub username of the person you\'re inviting')
    .option('--no-poll', 'Create the gist and exit without waiting for a response')
    .action(async (topic, options) => {
      const { create } = await import('./commands/create.js');
      await create(topic, options);
    });

  program
    .command('join')
    .description('Join an existing rendezvous conversation')
    .argument('<gist-url>', 'URL of the rendezvous gist')
    .action(async (gistUrl) => {
      const { join } = await import('./commands/join.js');
      await join(gistUrl);
    });

  program
    .command('status')
    .description('Check the status of a rendezvous conversation')
    .argument('<gist-url>', 'URL of the rendezvous gist')
    .action(async (gistUrl) => {
      const { status } = await import('./commands/status.js');
      await status(gistUrl);
    });

  program
    .command('result')
    .description('Show the final result of a rendezvous conversation')
    .argument('<gist-url>', 'URL of the rendezvous gist')
    .action(async (gistUrl) => {
      const { result } = await import('./commands/status.js');
      await result(gistUrl);
    });

  program.parse();
}
