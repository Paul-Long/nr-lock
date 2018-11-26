# nr-lock
node redis lock

#### Install

```bash
$ npm install nr-lock --save-dev
```

## API

- [new Lock(clients, opt)](#lock)
  - [clients](#lockclients)
  - [opt](#lockopt)

### Lock

create redis lock

```javascript
var Lock = require('nr-lock');
var lock = new Lock(clients, opt);
```

#### lock.clients

clients

```javascript
var RedisClient = require('redis').createClient;
// var RedisClient = require(ioredis);
var client1 = new RedisClient(redis);
var client2 = new RedisClient(redis);

var clients = [client1, client2];
```


#### lock.opt 

lock opt

```javascript
var opt = {
  resource: 'redis-lock',
  ttl: 5000,            // lock pexpire 5000ms
  delay: 2000           // retry delay 200ms
}
```

#### Usage

- use redis client

```javascript
var Lock = require('nr-lock');

var RedisClient = require('redis').createClient;
//  var RedisClient = require(ioredis);
var client1 = new RedisClient(redis);
var client2 = new RedisClient(redis);

var lock = new Lock([client1, client2], {
  resource: 'redis-lock',
  ttl: 5000,            // lock pexpire 5000ms
  delay: 2000           // retry delay 200ms
});

lock.startLock(function(master) {
  console.log(`client1 ${master === client1 ? 'is' : 'not'} master`);
  console.log(`client2 ${master === client2 ? 'is' : 'not'} master`);
})
```
