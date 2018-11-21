var tape = require('tape')
var tests = require('abstract-blob-store/tests')
var from = require('from2-buffer')
var collect = require('collect-stream')

var cacheStore = require('..')

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

tape('Confirm cache exists after writeStream finishes', function (t) {
  var buf = Buffer.alloc(50 * 1024 * 1024, 1) // 5MB buffer
  common.setup(tape, function (err, store) {
    t.error(err, 'setup did not error')
    var key = 'my/cat.jpg'
    var ws = store.createWriteStream(key, function (err) {
      t.error(err, 'created without error')
      collect(store.createReadStream(key), function (err, readBuf) {
        t.error(err)
        t.equal(readBuf.length, buf.length, 'Read buffer has expected length')
        common.teardown(tape, store, buf, function () {
          t.end()
        })
      })
    })
    store.exists(key, function (err, exists) {
      t.error(err)
      t.false(exists, 'does not exist at start of test')
      from(buf).pipe(ws)
    })
  })
})

tape('Confirm cache exists after writeStream callback', function (t) {
  var buf = Buffer.alloc(1 * 1024 * 1024, 1) // 5MB buffer
  common.setup(tape, function (err, store) {
    t.error(err, 'setup did not error')
    var key = 'my/cat.jpg'
    var ws = store.createWriteStream(key, function (err) {
      t.error(err, 'created without error')
      collect(store.createReadStream(key), function (err, readBuf) {
        t.error(err)
        t.equal(readBuf.length, buf.length, 'Read buffer has expected length')
        console.log(readBuf.slice(-20))
        common.teardown(tape, store, buf, function () {
          t.end()
        })
      })
    })
    store.exists(key, function (err, exists) {
      t.error(err)
      t.false(exists, 'does not exist at start of test')
      from(buf).pipe(ws)
    })
  })
})
