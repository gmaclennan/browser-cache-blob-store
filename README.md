# browser-cache-blob-store

[![build status](https://travis-ci.com/gmaclennan/browser-cache-blob-store.svg?branch=master)](http://travis-ci.com/gmaclennan/browser-cache-blob-store)

[![npm](https://img.shields.io/npm/v/browser-cache-blob-store.svg)](https://www.npmjs.com/package/browser-cache-blob-store)

[![blob-store-compatible](https://raw.githubusercontent.com/maxogden/abstract-blob-store/master/badge.png)](https://github.com/maxogden/abstract-blob-store)

[blob store](https://github.com/maxogden/abstract-blob-store) that stores blobs using the browser [Cache](https://developer.mozilla.org/en-US/docs/Web/API/Cache) interface. This interface is part of the Service Worker spec but is available to windowed scopes as well as workers.

```sh
npm install browser-cache-blob-store
```

## Usage

``` js
var cacheStore = require('browser-cache-blob-store')
var blobs = cacheStore()

var ws = blobs.createWriteStream({
  key: 'some/path/file.txt'
})

ws.write('hello world\n')
ws.end(function() {
  var rs = blobs.createReadStream({
    key: 'some/path/file.txt'
  })

  rs.pipe(process.stdout)
})
```

## License

MIT
