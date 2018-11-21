/* global ReadableStream */
var eos = require('end-of-stream')

module.exports = readableNodeToWeb
module.exports.WEBSTREAM_SUPPORT = typeof ReadableStream !== 'undefined'

function isFn (fn) {
  return typeof fn === 'function'
}

function isRequest (stream) {
  return stream.setHeader && isFn(stream.abort)
}

function readableNodeToWeb (nodeReadable) {
  if (!module.exports.WEBSTREAM_SUPPORT) throw new Error('No web ReadableStream support')
  let destroyed = false

  function start (controller) {
    let closed = false

    nodeReadable.on('close', function () {
      closed = true
    })

    nodeReadable.on('readable', readChunk)

    function readChunk () {
      let chunk
      while ((chunk = nodeReadable.read()) !== null) {
        controller.enqueue(chunk)
      }
    }

    eos(nodeReadable, function (err) {
      if (destroyed) return
      if (closed) return
      destroyed = true

      if (err) controller.error(err)
      else controller.close()
    })

    readChunk()
  }

  function pull () {
    console.log('pull')
  }

  function cancel () {
    destroyed = true
    if (isRequest(nodeReadable)) return nodeReadable.abort() // request.destroy just do .end - .abort is what we want
    if (isFn(nodeReadable.destroy)) return nodeReadable.destroy()
  }

  return new ReadableStream({
    start: start,
    pull: pull,
    cancel: cancel
    // queuingStrategy: new ByteLengthQueuingStrategy({ highWaterMark: 16384 })
  })
}
