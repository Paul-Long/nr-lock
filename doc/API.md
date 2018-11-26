## API

- [new Lock(clients, opt)](#lock)
  - [clients](#lockclients)
  - [opt](#lockopt)

#### Lock

create redis lock

```js
var Lock = require('nr-lock');
var lock = new Lock(clients, opt);
```

##### lock.clients

clients `Array`, can use [redis](https://www.npmjs.com/package/redis) or [ioredis](https://www.npmjs.com/package/ioredis) 
create Redis Client

```js
var RedisClient = require('redis').createClient;
// var RedisClient = require(ioredis);
var client1 = new RedisClient(redis);
var client2 = new RedisClient(redis);

var clients = [client1, client2];
```


##### lock.opt 

lock opt params

```js
var opt = {
  resource: 'redis-lock',   // default value "redis-lock"
  ttl: 5000,            // lock pexpire 5000ms
  delay: 2000           // retry delay 200ms
}
```
