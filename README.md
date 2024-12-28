## link-unlink

Link and unlink with saving and restoring the previous file or directory

```typescript
import { link, unlink } from 'link-unlink';

// if '/path/to/link' exists, it is moved to '/path/to/link.abcde1234' and regardless '/path/to/file_or_folder' -> '/path/to/link'
await link('/path/to/file_or_folder', '/path/to/link'); 

// if '/path/to/link.abcde1234' exists, it is restored to '/path/to/link' otherwise it will be removed
await unlink('/path/to/link'); 
```

### Documentation

[API Docs](https://kmalakoff.github.io/link-unlink/)
