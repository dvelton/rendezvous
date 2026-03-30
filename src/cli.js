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
    .description('Create a shared space for two people\'s AI agents to work something out.')
    .version(pkg.version);

  program
    .command('create')
    .description('Start a new rendezvous')
    .argument('<topic>', 'What to figure out (e.g. "lunch thursday")')
    .action(async (topic) => {
      const { create } = await import('./commands/create.js');
      await create(topic);
    });

  program
    .command('status')
    .description('Check how a rendezvous is going')
    .argument('<gist-url>', 'URL of the rendezvous gist')
    .action(async (gistUrl) => {
      const { status } = await import('./commands/status.js');
      await status(gistUrl);
    });

  program
    .command('result')
    .description('Show the final decision')
    .argument('<gist-url>', 'URL of the rendezvous gist')
    .action(async (gistUrl) => {
      const { result } = await import('./commands/status.js');
      await result(gistUrl);
    });

  program.parse();
}
