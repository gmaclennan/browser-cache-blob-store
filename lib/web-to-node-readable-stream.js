const Readable = require('readable-stream').Readable

class NodeReadable extends Readable {
  constructor (webStream, options) {
    super(options)
    this._webStream = webStream
    this._reader = webStream.getReader()
    this._reading = false
  }

  _read (size) {
    if (this._reading) {
      return
    }
    this._reading = true
    const doRead = () => {
      this._reader.read().then(res => {
        if (res.done) {
          this.push(null)
          return
        }
        if (this.push(res.value)) {
          return doRead(size)
        } else {
          this._reading = false
        }
      })
    }
    doRead()
  }
}

module.exports = function readableWebToNode (webStream) {
  return new NodeReadable(webStream)
}
