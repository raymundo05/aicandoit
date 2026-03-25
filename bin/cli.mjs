#!/usr/bin/env node

/**
 * AI Can Do It - Cross-platform Node.js wrapper.
 *
 * Locates a suitable bash interpreter on any OS (including Windows
 * via Git for Windows) and delegates to the real bash launcher.
 *
 * Author: Mike Lopez <e@mikelopez.com>
 * SPDX-License-Identifier: GPL-2.0-only
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

/** Path to the real bash launcher bundled with this package. */
const LAUNCHER = resolve(__dirname, 'aicandoit');

/**
 * Locate a working bash binary.
 *
 * On macOS / Linux the system bash is virtually always at /usr/bin/bash
 * or /bin/bash.  On Windows the most reliable source is Git for Windows
 * which installs bash under its own prefix.
 *
 * @returns {string} Absolute path to a bash executable.
 */
function findBash() {
  if (process.platform !== 'win32') {
    // Unix: just use the PATH lookup; bash is almost certainly available.
    return 'bash';
  }

  // Windows: check well-known Git for Windows locations first, then fall
  // back to whatever is on the PATH.
  const programFiles = [
    process.env.ProgramFiles,
    process.env['ProgramFiles(x86)'],
    process.env.ProgramW6432,
    'C:\\Program Files',
    'C:\\Program Files (x86)',
  ].filter(Boolean);

  for (const pf of programFiles) {
    const candidate = join(pf, 'Git', 'bin', 'bash.exe');
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  // WSL bash
  const wslBash = 'C:\\Windows\\System32\\bash.exe';
  if (existsSync(wslBash)) {
    return wslBash;
  }

  // Last resort: hope bash is on the PATH (e.g. MSYS2, Cygwin).
  return 'bash';
}

/**
 * Convert a Windows path to a POSIX path that Git Bash understands.
 * Example: C:\Users\foo\bar  ->  /c/Users/foo/bar
 *
 * @param {string} winPath
 * @returns {string}
 */
function toPosixPath(winPath) {
  if (process.platform !== 'win32') {
    return winPath;
  }
  // Replace backslashes with forward slashes.
  let p = winPath.replace(/\\/g, '/');
  // Convert drive letter:  C:/...  ->  /c/...
  p = p.replace(/^([A-Za-z]):\//, (_, drive) => `/${drive.toLowerCase()}/`);
  return p;
}

// ---- main ---------------------------------------------------------------

const bash = findBash();
const launcherPosix = toPosixPath(LAUNCHER);

const child = spawn(bash, [launcherPosix, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env },
});

child.on('error', (err) => {
  if (err.code === 'ENOENT') {
    console.error(
      'aicandoit: bash not found.\n' +
      'Install Git for Windows (https://gitforwindows.org) or add bash to your PATH.'
    );
    process.exit(127);
  }
  throw err;
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 1);
  }
});
