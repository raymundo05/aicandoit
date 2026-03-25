#!/usr/bin/env node

/**
 * AI Can Do It - postinstall script.
 *
 * Copies the bundled workflow skills into each supported CLI's skill
 * directory so the launcher can invoke them immediately after install.
 *
 * Author: Mike Lopez <e@mikelopez.com>
 * SPDX-License-Identifier: GPL-2.0-only
 */

import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const SKILLS_SRC = resolve(__dirname, '..', 'skills');
const home = homedir();

/** Skill targets keyed by CLI name. */
const targets = {
  claude: join(home, '.claude', 'skills'),
  codex:  join(home, '.codex', 'skills'),
};

if (!existsSync(SKILLS_SRC)) {
  // Running from a context where skills are not bundled; skip silently.
  process.exit(0);
}

for (const [cli, dest] of Object.entries(targets)) {
  try {
    mkdirSync(dest, { recursive: true });
    cpSync(SKILLS_SRC, dest, { recursive: true, force: true });
    console.log(`aicandoit: installed skills for ${cli} -> ${dest}`);
  } catch (err) {
    console.warn(`aicandoit: could not install skills for ${cli}: ${err.message}`);
  }
}
