/* global chmod */
'use strict';

require('shelljs/global');
var fs = require('vinyl-fs');
var map = require('map-stream');
var async = require('async');
var path = require('path');

var hooks = [
  'applypatch-msg',
  'commit-msg',
  'post-applypatch',
  'post-checkout',
  'post-commit',
  'post-flow-bugfix-delete',
  'post-flow-bugfix-finish',
  'post-flow-bugfix-publish',
  'post-flow-bugfix-pull',
  'post-flow-bugfix-start',
  'post-flow-bugfix-track',
  'post-flow-feature-delete',
  'post-flow-feature-finish',
  'post-flow-feature-publish',
  'post-flow-feature-pull',
  'post-flow-feature-start',
  'post-flow-feature-track',
  'post-flow-hotfix-delete',
  'post-flow-hotfix-finish',
  'post-flow-hotfix-publish',
  'post-flow-hotfix-start',
  'post-flow-release-branch',
  'post-flow-release-delete',
  'post-flow-release-finish',
  'post-flow-release-publish',
  'post-flow-release-start',
  'post-flow-release-track',
  'post-merge',
  'post-receive',
  'post-rewrite',
  'post-update',
  'pre-applypatch',
  'pre-auto-gc',
  'pre-commit',
  'pre-flow-feature-delete',
  'pre-flow-feature-finish',
  'pre-flow-feature-publish',
  'pre-flow-feature-pull',
  'pre-flow-feature-start',
  'pre-flow-feature-track',
  'pre-flow-hotfix-delete',
  'pre-flow-hotfix-finish',
  'pre-flow-hotfix-publish',
  'pre-flow-hotfix-start',
  'pre-flow-release-branch',
  'pre-flow-release-delete',
  'pre-flow-release-finish',
  'pre-flow-release-publish',
  'pre-flow-release-start',
  'pre-flow-release-track',
  'pre-push',
  'pre-rebase',
  'pre-receive',
  'prepare-commit-msg',
  'update'
];

function install(hook, dest, cb) {
  cb = cb || dest;

  if (!cb) cb(new Error('Callback must be supplied.'));
  if (typeof cb !== 'function') cb(new Error('Callback must be a function.'));
  if (hooks.indexOf(hook) === -1) cb(new Error('Invalid hook name.'));

  dest = ((typeof dest === 'function' ? null : dest) ||
    exec('git rev-parse --show-toplevel')
      .output.slice(0, -1) + '/.git/hooks/');

  var destHook = path.join(dest, hook);

  if (test('-f', destHook)) {
    var bakDest = destHook + '.guppy';

    if (!test('-f', bakDest)) {
      mv(destHook, bakDest);
    }
  }

  return fs.src(path.join(__dirname, 'scripts/hookfile'))
    .pipe(map(function(file, next) {
      file.path = file.path.replace('hookfile', hook);
      next(null, file);
    }))
    .pipe(fs.dest(dest))
    .on('finish', function () {
      chmod('u+x', destHook);
      cb(null, destHook);
    })
    .on('error', function (err) {
      cb(err);
    });
}

function installAll(dest, cb) {
  async.parallel(
    hooks.map(function (hook) {
      return function (next) {
        return install(hook, dest, next);
      };
    }),
    cb
  );
}

module.exports.install = install;
module.exports.installAll = installAll;
