# Bot Persistence on File System

Simple bot session persistence layer using the file system. Useful for local development.

## Installation

```
npm install bot-persistence-fs
```

## Usage

```javascript

const persistence = require('bot-persistence-fs')('sessionPath')

const user = {id: 12345}
persistence.retrieveSession(user).
.then(session => {
  // session is at least {user: {id: 12345}}
  // work with session
  return persistence.persistSession(session)
})
.then(result => console.log(result)) // success => true; failure => false
```

## License

[MIT](./LICENSE)
