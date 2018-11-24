'use strict';

var _require = require('./utils'),
    random = _require.random;

function Client(opt) {
  opt = opt || {};
  this._redis = opt.redis;
  this._lock = opt.lock;
  this._ttl = opt.ttl || 3000;
  this._isMaster = false;
  this._value = random();
}

Client.prototype.eval = function () {
  var _redis;

  return (_redis = this._redis).eval.apply(_redis, arguments);
};

Client.prototype.ops = function () {
  return this.isMaster() ? this._redis : null;
};

Client.prototype.setMaster = function (isMaster) {
  this._isMaster = isMaster;
};

Client.prototype.isMaster = function () {
  return this._isMaster;
};

Client.prototype.lock = function (loop) {
  if (this.isMaster()) {
    this._lock.extend(this, this._value, this._ttl, loop);
  } else {
    this._lock.lock(this, this._value, this._ttl, loop);
  }
};

Client.prototype.unlock = function (loop) {
  this._lock.unlock(this, this._value, loop);
};

module.exports = Client;