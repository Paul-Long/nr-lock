# nr-lock
node redis lock

## Install

```bash
$ npm install nr-lock --save-dev
```

## API

- [API](doc/API.md)

## How to use

- use redis client by callback

```js
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

lock.startLock(function(res) {
  if (res === 1) {
    // lock success 
    const master = lock.master();
  } else if (res === 0) {
    // lock failure
  } else {
    // error 
  }
})
```


- user redis client by async

```js
async function func() {
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

  const res = await lock.lock(); //redis client got lock
  if (res === 1) {
    // lock success
    const master = lock.master();
  } else if (res === 0) {
    // lock fail
  } else {
    // error
  }
  
  let retry = false;
  do {
    const has = lock.has(); // result true or false
    if (has === 1) {
      // lock is valid, do something
      retry = true;
    } else if (has === 0) {
      // lock is failure , do something
      retry = false;
    } else {
      // error 
    }
  } while (retry) ;
}

```

## License

[MIT](/LICENSE)
