const cmd = Symbol('__cmd__');
const resource = Symbol('__resource__');
const master = Symbol('__master__');
const scripts = Symbol('__scripts__');
const loop = Symbol('__loop__');

class Lock {
  constructor(option) {
    this[ cmd ] = {
      'set': 'redis.call("set", KEYS[1], ARGV[1], "NX", "PX", ARGV[2])',
      'get': 'redis.call("get", KEYS[1])',
      'del': 'redis.call("del", KEYS[1])',
      'ttl': 'redis.call("ttl", KEYS[1])',
      'pexpire': 'redis.call("pexpire", KEYS[1], ARGV[2])'
    };
    this[ resource ] = option.resource;
    this[ master ] = null;
    this[ scripts ] = {
      lock: 'if (' + this[ cmd ].set + ') then return 1 else return 0 end;',
      unlock: 'if ' + this[ cmd ].get + ' == ARGV[1] then return ' + this[ cmd ].del + ' else return 0 end;',
      extend: 'if (' + this[ cmd ].get + ' == ARGV[1]) then ' + this[ cmd ].pexpire + '; return 1; else return 0 end'
    };
  }

  lock = (client, value, ttl, callback) => {
    if (!client || !Object.prototype.hasOwnProperty.call(client, 'cmd')) {
      return false;
    }
    client.cmd(this[ scripts ].lock, 1, this[ resource ], value, ttl, this[ loop ]('lock', client, callback));
  };

  unlock = (client, value, callback) => {
    if (!client || !Object.prototype.hasOwnProperty.call(client, 'cmd')) {
      return false;
    }
    client.cmd(this[ scripts ].unlock, 1, this[ resource ], value, this[ loop ]('unlock', client, callback));
  };

  extend = (client, value, ttl, callback) => {
    if (!client || !Object.prototype.hasOwnProperty.call(client, 'cmd')) {
      return false;
    }
    client.cmd(this[ scripts ].extend, 1, this[ resource ], value, ttl, this[ loop ]('extend', client, callback));
  };

  [ loop ] = (type, client, callback) => {
    const self = this;
    return function (err, res) {
      if (err) {
        console.error(type + ' callback error : %j', err);
      } else {
        if (type === 'lock') {
          const isMaster = res === 1;
          client.setMaster(isMaster);
          if (client.isMaster() && self.master !== client) {
            self.master = client;
            callback(err, res, client.ops());
          }
        } else if (type === 'unlock') {
          client.setMaster(false);
          callback(err, res);
        } else if (type) {
          callback(err, res);
        }
      }
    };
  };
}

export default Lock;
