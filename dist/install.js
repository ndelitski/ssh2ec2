"use strict";

var _bluebird = require("bluebird");

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _utils = require('./utils');

var _nodeEmoji = require("node-emoji");

var CONF_PATH = _path2["default"].resolve(home(), '.ssh2ec2');

exports["default"] = _bluebird.coroutine(function* () {
  if (_fs2["default"].existsSync(CONF_PATH)) {
    var json = _fs2["default"].readFileSync(CONF_PATH, 'utf-8');
    var parsed = undefined;

    try {
      parsed = JSON.parse(json);
    } catch (err) {
      throw new Error("config " + CONF_PATH + " has bad format, failed to parse: " + err);
    }

    return parsed;
  } else {
    console.log("Hi, " + process.env.USER + _nodeEmoji.emoji.heart + "! Seems you first time here, configure:");

    var _ref = yield (0, _utils.prompt)([{
      type: 'input',
      name: 'keysDir',
      message: 'Where your SSH keys stored?(full path):'
    }]);

    var keysDir = _ref.keysDir;

    if (!_fs2["default"].existsSync(keysDir)) {
      console.error("directroy " + keysDir + " not found");
      exit(1);
    }

    var conf = { keysDir: keysDir };
    _fs2["default"].writeFileSync(CONF_PATH, JSON.stringify(conf, null, 4), 'utf-8');
    return conf;
  }
});

function home() {
  return process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
}
module.exports = exports["default"];