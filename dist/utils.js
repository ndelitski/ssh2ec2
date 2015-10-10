"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prompt = prompt;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _inquirer = require("inquirer");

var _inquirer2 = _interopRequireDefault(_inquirer);

function prompt() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new Promise(function (resolve) {
    _inquirer2["default"].prompt.apply(_inquirer2["default"], args.concat(resolve));
  });
}