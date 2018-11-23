const Lock = require('./Lock');
const Client = require('./Client');

function RedisLock(clients, opt) {
  opt = opt || {};
  this.resource = opt.resource || 'redis-lock';
  this.ttl = opt.ttl || 3000;
  this.delay = opt.delay || 1500;
  this._lock = new Lock({ resource: this.resource });
  this._clients = clients;
  this.interval = null;
  this.clients = (clients || []).map(redis => new Client({ redis, ttl: this.ttl, lock: this._lock }));
}

RedisLock.prototype.startLock = function (callback) {
  const self = this;
  if (this.interval) {
    clearInterval(self.interval);
    self.interval = null;
  }

  self.lock(callback);
  self.interval = setInterval(function () {
    self.lock(callback);
  }, this.delay);
};

RedisLock.prototype.lock = function lock(callback) {
  const { clients } = this;
  let waiting = clients.length;
  if (waiting === 0) return false;
  return new Promise(function (resolve, reject) {
    function loop(err, res, master) {
      if (err) {
        console.error('redislock callback error : %j', err);
      } else {
        console.info('redislock callback response : %j', res);
      }
      if (master) {
        (typeof callback === 'function') && callback(master);
      }
      if (waiting-- > 1) return;
      return resolve();
    }

    clients.forEach(client => client.lock(loop));
  });
};

RedisLock.prototype.unlock = function unlock(callback) {
  const { clients } = this;
  let waiting = clients.length;
  if (waiting === 0) return false;
  return new Promise(function (resolve, reject) {
    function loop(err, res) {
      if (err) {
        console.error('redislock unlock callback error : %j', err);
      } else {
        console.info('redislock unlock callback response : %j', res);
      }
      if (waiting-- > 1) return;
      callback();
      return resolve();
    }

    clients.forEach(client => client.unlock(loop));
  });
};

module.exports = RedisLock;
