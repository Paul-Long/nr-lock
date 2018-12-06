## API

- [new Lock(clients, opt)](#lock)
  - [clients](#argsclients)
  - [opt](#argsopt)
- [lock](#Lock.lock)
- [unlock](#Lock.unlock)
- [extend](#Lock.extend)
- [has](#Lock.has)

#### Lock

create redis lock

```js
var Lock = require('nr-lock');
var lock = new Lock(clients, opt);
```

##### args.clients

clients is `redis Array` or redis client, can use [redis](https://www.npmjs.com/package/redis) or [ioredis](https://www.npmjs.com/package/ioredis) 
create Redis Client

```js
var RedisClient = require('redis').createClient;
// var RedisClient = require(ioredis);
var client1 = new RedisClient(redis);
var client2 = new RedisClient(redis);

var clients = [client1, client2];
```


##### args.opt 

lock opt params

```js
var opt = {
  resource: 'redis-lock',   // default value "redis-lock"
  ttl: 5000,            // lock pexpire 5000ms
  delay: 2000           // retry delay 200ms
}
```

##### Lock.lock

get lock

```js
(async function () {
  var redis = await lock.lock();
  if (redis) {
    // redis got lock
  } else {
    // not got lock
  }
})()

// or

lock.lock(function(redis) {
  if (redis) {
    // redis got lock
  } else {
    // not got lock
  }
})
```

##### Lock.unlock

unlock

```js
(async function () {
  var error = await lock.unlock();
  if (error) {
    // unlock error
  } else {
    // unlock success
  }
})()

// or

lock.unlock(function(error) {
  if (error) {
    // unlock error
  } else {
    // unlock success
  }
})
```


###### Lock.extend

update lock ttl




###### Lock.has




