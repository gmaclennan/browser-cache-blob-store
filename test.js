var tape = require('tape')
var tests = require('abstract-blob-store/tests')
var cacheStore = require('./')

var common = {
  setup: function (t, cb) {
    // make a new blobs instance on every test
    cb(null, cacheStore('' + process.pid))
  },
  teardown: function (t, store, blob, cb) {
    window.caches.open(store.name).then(function (cache) {
      cache.keys().then(function (keys) {
        return Promise.all(keys.map(key => cache.delete(key)))
      }).then(function () {
        cb()
      })
    })
  }
}

tests(tape, common)
