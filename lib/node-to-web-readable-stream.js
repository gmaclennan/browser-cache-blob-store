/* global ReadableStream */

module.exports = readableNodeToWeb
module.exports.WEBSTREAM_SUPPORT = typeof ReadableStream !== 'undefined'

function readableNodeToWeb (nodeReadable) {
  if (!module.exports.WEBSTREAM_SUPPORT) throw new Error('No web ReadableStream support')
  function start (controller) {
    nodeReadable.pause()
    nodeReadable.on('data', (chunk) => {
      controller.enqueue(chunk)
      nodeReadable.pause()
    })
    nodeReadable.once('end', () => {
      controller.close()
    })
    nodeReadable.once('error', (e) => controller.error(e))
  }

  function pull () {
    nodeReadable.resume()
  }

  function cancel () {
    nodeReadable.destroy()
  }

  return new ReadableStream({
    start: start,
    pull: pull,
    cancel: cancel
  }, {
    highWaterMark: nodeReadable.readableHighWaterMark
  })
}
