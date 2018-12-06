import { random } from './utils';

const _redis = Symbol('__redis__');
const _lock = Symbol('__lock__');
const _ttl = Symbol('__ttl__');
const _isMaster = Symbol('__isMaster__');
const _value = Symbol('__value__');

class Client {
  constructor(option) {
    option = option || {};
    this[ _redis ] = option.redis;
    this[ _lock ] = option.lock;
    this[ _ttl ] = option.ttl || 3000;
    this[ _isMaster ] = false;
    this[ _value ] = option.value || random();
    this.cmd = this.cmd.bind(this);
  }

  cmd() {
    if (!this[ _redis ] || Object.prototype.hasOwnProperty.call(this[ _redis ], 'eval')) {
      return false;
    }
    return this[ _redis ].eval(...arguments);
  };

  ops = () => {
    return this.isMaster() ? this[ _redis ] : null;
  };

  isMaster = () => {
    return this[ _isMaster ];
  };

  setMaster = (isMaster) => {
    this[ _isMaster ] = isMaster;
  };

  lock = (loop) => {
    if (this.isMaster()) {
      return this[ _lock ].extend(this, this[ _value ], this[ _ttl ], loop);
    }
    return this[ _lock ].lock(this, this[ _value ], this[ _ttl ], loop);
  };

  unlock = (loop) => {
    if (this.isMaster()) {
      return this[ _lock ].unlock(this, this[ _value ], loop);
    }
  };

  extend = (loop) => {
    if (this.isMaster()) {
      return this[ _lock ].extend(this, this[ _value ], this[ _ttl ], loop);
    }
  };

  has = (loop) => {
    this[ _lock ].has(this, this[ _value ], loop);
  };
}

export default Client;
