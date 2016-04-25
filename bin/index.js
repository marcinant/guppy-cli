#!/usr/bin/env node
/* global error */
'use strict';

require('shelljs/global');
var fs = require("fs");
var gup = require('../');
var yargs = require('yargs')
  .usage('Usage: $0 <hookname>|all [-d <path>]')
  .command('hookname', 'Install a git-hook by name, for a list, see --hooks')
  .command('all', 'Install all available git-hooks (use caution)')
  .alias('d', 'dest')
  .describe('d', 'Destination path for git-hook (default: ./.git/hooks/)')
  .describe('hooks', 'Print a complete list of git-hooks')
  .help('h')
  .alias('h', 'help')
  .example('$0 pre-commit')
  .example('$0 pre-commit -d some/where')
  .example('$0 all')
  .version(function() {
    return require('../package').version;
  })
  .epilogue('Existing git-hooks will be backed up the first time. If a backup ' +
    'already exists, it will not be overwritten.' +
    '\n\nhttps://github.com/therealklanni/guppy-cli');
var argv = yargs.argv;

var hooks = '  applypatch-msg, commit-msg, post-applypatch, post-checkout, ' +
  'post-commit,\n post-flow-bugfix-delete, post-flow-bugfix-finish, post-flow-bugfix-publish, post-flow-bugfix-pull, ' +
  'post-flow-bugfix-start, post-flow-bugfix-track, post-flow-feature-delete, post-flow-feature-finish, ' +
  'post-flow-feature-publish, post-flow-feature-pull, post-flow-feature-start, post-flow-feature-track, ' +
  'post-flow-hotfix-delete, post-flow-hotfix-finish, post-flow-hotfix-publish, post-flow-hotfix-start, ' +
  'post-flow-release-branch, post-flow-release-delete, post-flow-release-finish, post-flow-release-publish, ' +
  'post-flow-release-start, post-flow-release-track, post-merge, post-receive, post-rewrite, post-update, ' +
  'pre-applypatch,\n  pre-auto-gc, pre-commit, pre-push, pre-rebase, ' +
  'pre-receive,\n  prepare-commit-msg, update';

if (argv.hooks) {
  console.log('Available git-hooks are:\n' + hooks);
  exit(0);
}

var dest;

if (argv.dest) {
  dest = argv.dest;
} else {
  var topLevel = exec('git rev-parse --show-toplevel', { silent: true })
    .output.slice(0, -1);
  if (test('-f', topLevel + '/.git')) {
    // this is a sub module
    var buf = fs.readFileSync(topLevel + '/.git', "utf8").trim();
    if (buf.substr(0,6) === 'gitdir') {
      topLevel = topLevel + '/' + buf.substr(8).trim();
    }
    dest = topLevel + '/hooks/';
  } else {
    dest = topLevel + '/.git/hooks/';
  }

  if (error()) {
    console.error('fatal: Not a git repository (or any of the parent directories): .git');
    exit(1);
  }
}

var hook = argv._[0];

if (!hook) {
  yargs.showHelp();
  exit(2);
}

if (hook.toLowerCase() === 'all') {
  gup.installAll(dest, function (err) {
    if (err) {
      console.error('fatal: ' + err.message);
      exit(3);
    }

    console.log('guppy: Installed all git-hooks to: ' + dest);
    exit(0);
  });
} else if (hooks.indexOf(hook) !== -1) {
  gup.install(hook, dest, function (err, results) {
    if (err) {
      console.error('fatal: ' + err.message);
      exit(4);
    }

    console.log('guppy: Installed git-hook: ' + results);
    exit(0);
  });
} else {
  console.error('fatal: Invalid hook name: ' + hook);
  exit(5);
}
