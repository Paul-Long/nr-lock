'use strict';

var cmd = {
  'set': 'redis.call("set", KEYS[1], ARGV[1], "NX", "PX", ARGV[2])',
  'get': 'redis.call("get", KEYS[1])',
  'del': 'redis.call("del", KEYS[1])',
  'ttl': 'redis.call("ttl", KEYS[1])',
  'pexpire': 'redis.call("pexpire", KEYS[1], ARGV[2])'
};

function Lock(option) {
  option = option || {};
  this.resource = option.resource;
  this.master = null;
  this.scripts = {
    lock: 'if (' + cmd.set + ') then return 1 else return 0 end;',
    unlock: 'if ' + cmd.get + ' == ARGV[1] then return ' + cmd.del + ' else return 0 end;',
    extend: 'if (' + cmd.get + ' == ARGV[1]) then ' + cmd.pexpire + '; return 1; else return 0 end'
  };
}

Lock.prototype.lock = function (client, value, ttl, callback) {
  var scripts = this.scripts,
    resource = this.resource;

  client.eval(scripts.lock, 1, resource, value, ttl, this.loop('lock', client, callback));
};

Lock.prototype.unlock = function (client, value, callback) {
  var scripts = this.scripts,
    resource = this.resource;

  client.eval(scripts.unlock, 1, resource, value, this.loop('unlock', client, callback));
};

Lock.prototype.extend = function (client, value, ttl, callback) {
  var scripts = this.scripts,
    resource = this.resource;

  client.eval(scripts.extend, 1, resource, value, ttl, this.loop('extend', client, callback));
};

Lock.prototype.loop = function (type, client, callback) {
  var self = this;
  return function (err, res) {
    if (err) {
      console.error(type + ' callback error : %j', err);
    } else {
      if (type === 'lock') {
        var isMaster = res === 1;
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

module.exports = Lock;