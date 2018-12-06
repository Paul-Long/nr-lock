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

lock.startLock(function(master) {
  console.log(`client1 ${master === client1 ? 'is' : 'not'} master`);
  console.log(`client2 ${master === client2 ? 'is' : 'not'} master`);
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

  const redis = await lock.lock(); //redis client got lock
  if (redis) {
    // got lock
  } else {
    // not get lock
  }
  
  let retry = false;
  do {
    const has = lock.has(); // result true or false
    if (has) {
      // lock is valid, do something
      retry = true;
    } else {
      // lock is failure , do something
      retry = false;
    }
  } while (retry) ;
}

```

## License

[MIT](/LICENSE)
