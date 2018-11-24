'use strict';

var Lock = require('./Lock');
var Client = require('./Client');

function RedisLock(clients, opt) {
  var _this = this;

  opt = opt || {};
  this.resource = opt.resource || 'redis-lock';
  this.ttl = opt.ttl || 3000;
  this.delay = opt.delay || 1500;
  this._lock = new Lock({ resource: this.resource });
  this._clients = clients;
  if (!this._clients || this._clients.length === 0) {
    throw new Error('RedisLock must be instantiated with at least one redis server.');
  }
  this.interval = null;
  this.clients = (clients || []).map(function (redis) {
    return new Client({ redis: redis, ttl: _this.ttl, lock: _this._lock });
  });
}

RedisLock.prototype.startLock = function (callback) {
  var self = this;
  if (this.interval) {
    clearInterval(self.interval);
    self.interval = null;
  }

  self.lock(callback);
  self.interval = setInterval(function () {
    self.lock(callback);
  }, this.delay);
};

RedisLock.prototype.lock = function (callback) {
  var clients = this.clients;

  var waiting = clients.length;
  if (waiting === 0) return false;
  return new Promise(function (resolve, reject) {
    function loop(err, res, master) {
      if (err) {
        console.error('redislock callback error : %j', err);
      }
      if (master) {
        typeof callback === 'function' && callback(master);
      }
      if (waiting-- > 1) return;
      return resolve();
    }

    clients.forEach(function (client) {
      return client.lock(loop);
    });
  });
};

RedisLock.prototype.unlock = function (callback) {
  var clients = this.clients;

  var waiting = clients.length;
  if (waiting === 0) return false;
  return new Promise(function (resolve, reject) {
    function loop(err, res) {
      if (err) {
        console.error('redislock unlock callback error : %j', err);
      }
      if (waiting-- > 1) return;
      callback();
      return resolve();
    }

    clients.forEach(function (client) {
      return client.unlock(loop);
    });
  });
};

module.exports = RedisLock;