var eos = require('end-of-stream')
var duplexify = require('duplexify')
var through = require('through2')

var nodeToWebStream = require('readable-stream-node-to-web')
var webStreamToNode = require('./lib/web-to-node-readable-stream')

var noop = function() {}

var listen = function(stream, opts, cb) {
  if (!cb) return stream
  eos(stream, function(err) {
    if (err) return cb(err)
    cb(null, opts)
  })
  return stream
}

var BlobStore = function(opts) {
  if (!window || !window.caches) throw 'Not supported on this platform'
  if (!(this instanceof BlobStore)) return new BlobStore(opts)
  opts = opts || {}
  if (typeof opts === 'string') opts = {name:opts}

  this.name = opts.name || 'blob-store'
}

BlobStore.prototype.createWriteStream = function(opts, cb) {
  if (typeof opts === 'string') opts = {key:opts}
  if (opts.name && !opts.key) opts.key = opts.name

  var proxy = listen(through(), opts, cb)

  var response = new Response(nodeToWebStream(proxy))

  window.caches.open(this.name).then(function (cache) {
    cache.put(opts.key, response)
  })
  return proxy
}

BlobStore.prototype.createReadStream = function(key, opts) {
  if (key && typeof key === 'object') return this.createReadStream(key.key, key)
  var proxy = duplexify()
  proxy.setWritable(false)
  window.caches.open(this.name).then(function (cache) {
    cache.match(key).then(function (response) {
      if (!response) {
        var err = new Error('NotFound')
        err.notFound = true
        return proxy.destroy(err)
      }
      proxy.setReadable(webStreamToNode(response.body))
    })
  })
  return proxy
}

BlobStore.prototype.exists = function(opts, cb) {
  if (typeof opts === 'string') opts = {key:opts}
  window.caches.open(this.name).then(function (cache) {
    cache.match(opts.key).then(function (response) {
      cb(null, !!response)
    })
  })
  // if (typeof opts === 'string') opts = {key:opts}
  // var key = join(this.path, opts.key)
  // fs.stat(key, function(err, stat) {
  //   if (err && err.code !== 'ENOENT') return cb(err)
  //   cb(null, !!stat)
  // })
}

BlobStore.prototype.remove = function(opts, cb) {
  if (typeof opts === 'string') opts = {key:opts}
  window.caches.open(this.name).then(function (cache) {
    cache.delete(opts.key).then(function (deleted) {
      cb()
    })
  })
}

module.exports = BlobStore
