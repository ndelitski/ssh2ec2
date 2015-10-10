"use strict";

var _bluebird = require("bluebird");

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var listAll = _bluebird.coroutine(function* () {
  return parseInstancesList((yield ec2.describeInstancesAsync({ Filters: [{ Name: 'instance-state-name', Values: ['running'] }] })));
});

exports.listAll = listAll;

var listByName = _bluebird.coroutine(function* (name) {
  var items = yield listAll();
  return items.filter(function (i) {
    return i.name.match(name);
  });
});

exports.listByName = listByName;

var usernameForImageId = _bluebird.coroutine(function* (imageId) {
  var _ref = yield ec2.describeImagesAsync({ ImageIds: [imageId] });

  var Images = _ref.Images;

  return getSSHUser(Images[0].Name);
});

exports.usernameForImageId = usernameForImageId;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _awsSdk = require("aws-sdk");

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird2 = _interopRequireDefault(_bluebird);

var ec2 = (0, _bluebird.promisifyAll)(new _awsSdk.EC2({ region: 'eu-west-1' }));

function getSSHUser(imageName) {
  if (imageName.match(/rancher/i)) {
    return 'rancher';
  } else if (imageName.match(/ecs/i)) {
    return 'ec2-user';
  } else if (imageName.match(/ubuntu/i)) {
    return 'ubuntu';
  } else if (imageName.match(/amzn/i)) {
    return 'ec2-user';
  } else {
    throw new Error("dont know user for ami: " + imageName);
  }
}

function parseInstancesList(instances) {
  var Reservations = instances.Reservations;

  return (0, _lodash.chain)(Reservations).pluck('Instances').flatten().filter(function (_ref2) {
    var PublicDnsName = _ref2.PublicDnsName;
    var Tags = _ref2.Tags;
    return (0, _lodash.find)(Tags, { Key: 'Name' }) && PublicDnsName;
  }).map(function (_ref3) {
    var PublicDnsName = _ref3.PublicDnsName;
    var Tags = _ref3.Tags;
    var KeyName = _ref3.KeyName;

    var other = _objectWithoutProperties(_ref3, ["PublicDnsName", "Tags", "KeyName"]);

    return _extends({ name: (0, _lodash.find)(Tags, { Key: 'Name' }).Value, dns: PublicDnsName, key: KeyName }, other);
  }).value();
}