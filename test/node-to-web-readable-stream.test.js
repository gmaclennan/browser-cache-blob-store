var test = require('tape')
var from = require('from2-string')
var ReadableStream = require('readable-stream').Readable
var nodeToWebStream = require('../lib/node-to-web-readable-stream')

test('sanity check', function (t) {
  var str = 'foobar'
  streamToString(nodeToWebStream(from(str)))
    .then(output => {
      t.equal(str, output)
      t.end()
    })
    .catch(err => t.end(err))
})

test('cancel() ensures cleanup', function (t) {
  t.timeoutAfter(3000)
  var nodeStream = from('foobar')
  nodeStream._destroy = function () {
    t.end()
  }
  var webStream = nodeToWebStream(nodeStream)

  nodeStream.on('end', function () {
  })

  webStream.cancel()
})

test('cancel() ensures _destroy()', function (t) {
  t.timeoutAfter(3000)
  var nodeStream = from('foobar')
  var webStream = nodeToWebStream(nodeStream)

  nodeStream._destroy = function () {
    t.end()
  }

  webStream.cancel()
})

test('errored node stream', function (t) {
  t.timeoutAfter(3000)
  var nodeStream = new ReadableStream({ read: function () {} })
  var webStream = nodeToWebStream(nodeStream)

  nodeStream.emit('error', new Error('foobar'))

  webStream.getReader().read().catch(function (err) {
    t.equals(err.message, 'foobar')
    t.end()
  })
})

test('node stream closed early', function (t) {
  t.timeoutAfter(3000)
  var nodeStream = new ReadableStream({ read: function () {} })
  var webStream = nodeToWebStream(nodeStream)

  nodeStream.push(null)

  webStream.getReader().read().then(function (result) {
    t.equals(result.done, true)
    t.end()
  })
})

function streamToString (stream) {
  return new Promise(function (resolve, reject) {
    let reader = stream.getReader()
    let buffer = ''
    reader.read().then(onRead)

    function onRead (result) {
      if (result.done) return resolve(buffer)

      buffer += result.value.toString()
      reader.read().then(onRead)
    }
  })
}
