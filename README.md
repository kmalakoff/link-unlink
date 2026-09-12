# link-unlink

Link and unlink with saving and restoring the previous file or directory

```sh
npm install link-unlink
```

In a CommonJS `.cjs` file:

```js
var linkUnlink = require('link-unlink');

// if '/path/to/link' exists, it is moved to '/path/to/link.abcde1234' and regardless '/path/to/file_or_folder' -> '/path/to/link'
linkUnlink.link('/path/to/file_or_folder', '/path/to/link', function (err) {
  if (err) throw err;

  // Restore the saved entry, or remove the link when no saved entry exists.
  linkUnlink.unlink('/path/to/link', function (err) {
    if (err) throw err;
  });
});
```

### Documentation

[API Docs](https://kmalakoff.github.io/link-unlink/)
