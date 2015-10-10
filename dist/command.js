"use strict";

var _bluebird = require("bluebird");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require("lodash");

var _awsHelpers = require("./aws-helpers");

var _inquirer = require("inquirer");

var _inquirer2 = _interopRequireDefault(_inquirer);

var _bluebird2 = _interopRequireDefault(_bluebird);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _nodeEmoji = require("node-emoji");

var _fs = require("fs");

var _child_process = require("child_process");

var _install = require("./install");

var _install2 = _interopRequireDefault(_install);

var _utils = require('./utils');

var exit = process.exit;
var warn = console.warn;
var log = console.log;
var error = console.error;

_bluebird.coroutine(function* () {
  var _ref = yield (0, _install2["default"])();

  var keysDir = _ref.keysDir;

  log(keysDir);

  var name = process.argv[2];
  if (!name) {
    warn('type instance name');
  }

  var instances = (0, _lodash.sortBy)((yield (0, _awsHelpers.listByName)(name)), 'name');

  if (!instances.length) {
    log("no instances found with name '" + name + "'");
    exit(0);
  }

  var _ref2 = yield (0, _utils.prompt)([{
    type: "list",
    name: "item",
    message: "Select instance connect to?",
    choices: instances.map(formatItem)
  }]);

  var item = _ref2.item;

  var index = item.match(/^\d+/)[0];
  var selected = instances[index];
  var user = yield (0, _awsHelpers.usernameForImageId)(selected.ImageId);

  ssh({ dns: selected.dns, key: _path2["default"].join(keysDir, selected.key + ".pem"), user: user });
})();

process.on('uncaughtException', function (err) {
  error(err);
  error(err.stack);
  exit(1);
});

function ssh(_ref3) {
  var dns = _ref3.dns;
  var key = _ref3.key;
  var user = _ref3.user;

  if (!(0, _fs.existsSync)(key)) {
    warn(key + " not found");
    exit(1);
  }

  // write to stderr for wrapper bash script
  var cmd = "ssh -i " + key + " " + user + "@" + dns + " -o StrictHostKeyChecking=no";
  //fs.createWriteStream(null, { fd: 3 }).end();
  error(cmd);

  return;
  var ssh = (0, _child_process.spawn)('ssh', ['-tt', '-l', 'ec2-user', '-i', keyPath, dns, '-o', 'StrictHostKeyChecking=no']);

  process.stdin.pipe(ssh.stdin);
  process.stdin.resume();

  ssh.stdout.pipe(process.stdout);
  ssh.stderr.pipe(process.stderr);

  process.on('SIGINT', function () {
    console.log('MAIN');
  });

  ssh.on('SIGINT', function () {
    console.log('child');
  });

  ssh.on('exit', function (code) {
    log('ssh process exit with code ' + code);
    exit(0);
  });
}

function formatItem(_ref4, i) {
  var name = _ref4.name;
  var LaunchTime = _ref4.LaunchTime;
  var InstanceId = _ref4.InstanceId;

  var time = (0, _moment2["default"])(LaunchTime).fromNow();
  return i + " " + name + " " + _nodeEmoji.emoji.alarm_clock + time + " [" + InstanceId + "]";
}