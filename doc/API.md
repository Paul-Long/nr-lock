## API

- [new Lock(clients, opt)](#lock)
  - [clients](#argsclients)
  - [opt](#argsopt)
- [lock](#Locklock)
- [unlock](#Lockunlock)
- [extend](#Lockextend)
- [has](#Lockhas)

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
  var res = await lock.lock();
  if (res === 1) {
    // lock success
  } else if (res === 0) {
    // lock fail
  } else {
    // error
  }
})()

// or

lock.lock(function(res) {
  if (res === 1) {
    // lock success
  } else if (res === 0) {
    // lock fail
  } else {
    // error
  }
})
```

##### Lock.unlock

unlock

```js
(async function () {
  var res = await lock.unlock();
  if (res === 1) {
    // unlock success
  } else if (res === 0) {
    // unlock fail
  } else {
    // error
  }
})()

// or

lock.unlock(function(res) {
  if (res === 1) {
    // unlock success
  } else if (res === 0) {
    // unlock fail
  } else {
    // error
  }
})
```


###### Lock.extend

update lock ttl, result (success : 1) (fail : 0) 

```js
(async function () {
  var res = await lock.extend();
  if (res === 1) {
    // extend success
  } else if (res === 0) {
    // extend fail
  } else {
    // error
  }
})()

// or

lock.extend(function(res) {
  if (res === 1) {
    // extend success
  } else if (res === 0) {
    // extend fail
  } else {
    // error
  }
})
```



###### Lock.has

checked has lock 

```js
(async function () {
  var res = await lock.has();
  if (res === 1) {
    // has 
  } else if (res === 0) {
    // no
  } else {
    // error
  }
})()

// or

lock.extend(function(res) {
  if (res === 1) {
    // has 
  } else if (res === 0) {
    // no
  } else {
    // error
  }
})
```


