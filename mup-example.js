module.exports = {
  servers: {
    one: {
      host: 'server.ip',
      username: 'root',
      pem: '/path/to/.ssh/id_rsa'
    }
  },

  meteor: {
    name: 'botman',
    path: '.',
    servers: {
      one: {}
    },
    buildOptions: {
      debug: true
    },
    env: {
      PORT: 3002,
      ROOT_URL: 'http://app.url',
      MONGO_URL: 'mongodb://dbusername:password@xxxxxx.mlab.com:port/username'
    },
    dockerImage: 'abernix/meteord:base',
    deployCheckWaitTime: 300 // default 10
  }
}
