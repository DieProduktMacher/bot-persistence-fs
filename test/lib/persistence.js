'use strict'

describe('persistence', function () {
  let persistence,
    fs

  const sessionPath = 'whateveryoulike'

  beforeEach(function () {
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    })
    fs = {
      readFile: sinon.stub(),
      writeFile: sinon.stub()
    }
    mockery.registerMock('fs-extra', fs)

    persistence = libRequire('persistence')(sessionPath)
  })

  afterEach(function () {
    mockery.deregisterAll()
    mockery.disable()
  })

  describe('retrieveSession', function () {
    const user = {}

    beforeEach(function () {
      user.id = Math.floor(Math.random() * 1000 + 1000)
    })

    it('tries to read the session from file by user id', function () {
      fs.readFile.callsFake(() => Promise.resolve())
      return persistence.retrieveSession(user)
      .then(_ => {
        expect(fs.readFile).to.have.been.calledWith(`${sessionPath}/${user.id}.json`, {encoding: 'utf8'})
      })
    })

    describe('session file does not exist', function () {
      it('return the default session', function () {
        fs.readFile.callsFake(() => Promise.reject(new Error()))
        return persistence.retrieveSession(user)
          .then(session => {
            expect(session).to.eql({user})
          })
      })
    })

    describe('session file exists', function () {
      it('JSON.parse()-es the contents of the file', function () {
        const sessionString = JSON.stringify({random: Math.random()})
        const jsonParse = sinon.spy(JSON, 'parse')
        fs.readFile.callsFake(() => Promise.resolve(sessionString))
        return persistence.retrieveSession(user)
        .then(session => {
          expect(jsonParse).to.have.been.calledWith(sessionString)
          JSON.parse.restore()
        })
      })

      it('returns the session and ensures the user is there', function () {
        const sessionContents = {random: Math.random()}
        fs.readFile.callsFake(() => Promise.resolve(JSON.stringify(sessionContents)))
        return persistence.retrieveSession(user)
          .then(session => {
            expect(session).to.eql(Object.assign(sessionContents, {user}))
          })
      })

      it('return the default session when the file content is not JSON.parse()-able', function () {
        fs.readFile.callsFake(() => Promise.resolve('NO VALID JSON'))
        return persistence.retrieveSession(user)
          .then(session => {
            expect(session).to.eql({user})
          })
      })
    })
  })

  describe('persistSession', function () {
    const session = {user: {}, random: Math.random()}

    beforeEach(function () {
      session.user.id = Math.floor(Math.random() * 1000 + 1000)
    })

    describe('normal operation', function () {
      let jsonStringify
      beforeEach(function () {
        fs.writeFile.callsFake(() => Promise.resolve())
        jsonStringify = sinon.stub(JSON, 'stringify').callsFake(() => 'stringifiedSession')
      })

      afterEach(function () {
        JSON.stringify.restore()
      })

      it('JSON.stringify()-es the session', function () {
        return persistence.persistSession(session)
          .then(result => {
            expect(jsonStringify).to.have.been.calledWith(session)
          })
      })

      it('writes the stringifiedSession to the session file', function () {
        return persistence.persistSession(session)
          .then(result => {
            expect(fs.writeFile).to.have.been.calledWith(`${sessionPath}/${session.user.id}.json`, 'stringifiedSession', 'utf8')
          })
      })

      it('resolves to tue', function () {
        return persistence.persistSession(session)
          .then(result => {
            expect(result).to.equal(true)
          })
      })
    })

    it('catches errors', function () {
      fs.writeFile.callsFake(() => Promise.reject(new Error()))
      return persistence.persistSession(session)
        .then(result => {
          expect(result).to.equal(false)
        })
    })
  })
})
