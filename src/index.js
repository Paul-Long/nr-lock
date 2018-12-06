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
const value = Symbol('__value__');
const _master = Symbol('__master__');

class RedisLock {
  constructor(arr, opt) {
    opt = opt || {};
    this[ resource ] = opt.resource || 'redis-lock';
    this[ ttl ] = opt.ttl || 3000;
    this[ delay ] = opt.delay || 1500;
    this[ _lock ] = new Lock({ resource: this[ resource ] });
    this[ _clients ] = [];
    this[ value ] = opt.value || null;
    this[ _master ] = null;
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
    return new Client({ redis, ttl: this[ ttl ], lock: this[ _lock ], value: this[ value ] });
  };

  master = () => {
    return this[ _master ] ? this[ _master ].ops() : null;
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
    let m = null;
    const error = [];
    let success = false;
    const _this = this;
    return new Promise(function (resolve, reject) {
      function loop(err, res, client) {
        if (err) {
          console.error('redislock callback error : %j', err);
          error.push(err);
        }
        success = success || (res === 1);
        if (client && res === 1) {
          m = client;
        }
        if (waiting-- > 1) return;
        if (!m) {
          return resolve(0);
        }
        if (_this[ _master ] !== m) {
          _this[ _master ] = m;
          typeof callback === 'function' && callback(success ? 1 : 0);
          if (error.length > 0) return reject(error);
          return resolve(success ? 1 : 0);
        }
      }

      try {
        __clients.forEach(function (client) {
          return client.lock(loop);
        });
      } catch (e) {
        console.error(e);
        throw Error('redis lock error');
      }
    });
  };

  unlock = (callback) => {
    const __clients = this[ clients ];
    let waiting = __clients.length;
    if (waiting === 0) return false;
    const error = [];
    let success = false;
    return new Promise(function (resolve, reject) {
      function loop(err, res, client) {
        if (err) {
          console.error('redislock unlock callback error : %j', err);
          error.push({ client: client.ops(), error: err });
        }
        success = success || (res === 1);
        if (waiting-- > 1) return;
        if (typeof callback === 'function') {
          callback();
        }
        if (error.length > 0) {
          return reject(error);
        }
        return resolve(success ? 1 : 0);
      }

      try {
        __clients.forEach(function (client) {
          return client.unlock(loop);
        });
      } catch (e) {
        console.error(e);
        throw Error('redis unlock error');
      }
    });
  };

  has = (callback) => {
    const __clients = this[ clients ];
    let waiting = __clients.length;
    if (waiting === 0) return false;
    const error = [];
    let _has = false;
    return new Promise(function (resolve, reject) {
      function loop(err, res, client) {
        if (err) {
          console.error('redislock has callback error : %j', err);
          error.push({ client: client.ops(), error: err });
        }
        _has = _has || res === 1;
        if (waiting-- > 1) return;
        if (typeof callback === 'function') {
          callback(_has ? 1 : 0);
        }
        if (error.length > 0) {
          return reject(error);
        }
        return resolve(_has ? 1 : 0);
      }

      try {
        __clients.forEach(function (client) {
          return client.has(loop);
        });
      } catch (e) {
        console.error(e);
        throw Error('redis has lock error');
      }
    });
  };

  extend = (callback) => {
    const __clients = this[ clients ];
    let waiting = __clients.length;
    if (waiting === 0) return false;
    const error = [];
    let success = false;
    return new Promise(function (resolve, reject) {
      function loop(err, res, client) {
        if (err) {
          console.error('redislock extend callback error : %j', err);
          error.push({ client: client.ops(), error: err });
        }
        success = success || res === 1;
        if (waiting-- > 1) return;
        if (typeof callback === 'function') {
          callback(success ? 1 : 0);
        }
        if (error.length > 0) {
          return reject(error);
        }
        return resolve(success ? 1 : 0);
      }

      try {
        __clients.forEach(function (client) {
          return client.extend(loop);
        });
      } catch (e) {
        console.error(e);
        throw Error('redis extend lock error');
      }
    });
  };
}

export default RedisLock;
