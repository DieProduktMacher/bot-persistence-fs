'use strict'

// Standard modules
const fs = require('fs-extra')
const path = require('path')

// Library modules
const log = require('level-logger')('bot-persistence-fs')

module.exports = (sessionPath) => {
  const getFilePath = (userId) => path.join(sessionPath, `${userId}.json`)

  const retrieveSession = (user) => fs.readFile(getFilePath(user.id), {encoding: 'utf8'})
    .then(session => {
      try {
        return Object.assign(JSON.parse(session), {user})
      } catch (error) {
        return Promise.reject(error)
      }
    })
    .catch(error => {
      // If it is a new user save defaults
      log.error('failed retrieving session', error)
      log.debug('returning default session')
      return {user}
    })

  const persistSession = (session) => {
    log.debug('persisting session', session)
    return fs.writeFile(getFilePath(session.user.id), JSON.stringify(session, null, 2), 'utf8')
      .then(_ => true)
      .catch(error => {
        log.error('failed persisting session', error)
        return false
      })
  }

  return {
    retrieveSession,
    persistSession
  }
}
