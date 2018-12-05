import Lock from './Lock';
import Client from './Client';

const resource = Symbol('__resource__');
const ttl = Symbol('__ttl__');
const delay = Symbol('__delay__');
const _lock = Symbol('__lock__');
const _clients = Symbol('_redis_clients__');
const interval = Symbol('__interval__');
const clients = Symbol('__clients__');
const createClient = Symbol('__createClient__');

class RedisLock {
  constructor(arr, opt) {
    opt = opt || {};
    this[ resource ] = opt.resource || 'redis-lock';
    this[ ttl ] = opt.ttl || 3000;
    this[ delay ] = opt.delay || 1500;
    this[ _lock ] = new Lock({ resource: this[ resource ] });
    this[ _clients ] = [];
    if (arr instanceof Array) {
      this[ _clients ] = arr || [];
    } else {
      this[ _clients ].push(arr);
    }
    if (this[ _clients ].length === 0) {
      throw new Error('RedisLock must be instantiated with at least one redis server.');
    }
    this[ interval ] = null;
    this[ clients ] = (this[ _clients ] || []).map(redis => this[ createClient ](redis));
  }

  [ createClient ] = (redis) => {
    return new Client({ redis, ttl: this[ ttl ], lock: this[ _lock ] });
  };

  startLock = (callback) => {
    if (this[ interval ]) {
      clearInterval(this[ interval ]);
    }
    const _this = this;
    this.lock(callback);
    this[ interval ] = setInterval(function () {
      _this.lock(callback);
    }, this[ delay ]);
  };

  lock = (callback) => {
    const __clients = this[ clients ];
    let waiting = __clients.length;
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

      __clients.forEach(function (client) {
        return client.lock(loop);
      });
    });
  };

  unlock = (callback) => {
    const __clients = this[ clients ];
    let waiting = __clients.length;
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

      __clients.forEach(function (client) {
        return client.unlock(loop);
      });
    });
  };
}

export default RedisLock;
