import assert from 'assert';

// @ts-ignore
import { link, unlink } from 'module-link-unlink';
// @ts-ignore
import linkUnlink from 'module-link-unlink';

describe('exports .ts', () => {
  it('defaults', () => {
    assert.equal(typeof linkUnlink.link, 'function');
    assert.equal(typeof linkUnlink.unlink, 'function');
  });
  it('link', () => {
    assert.equal(typeof link, 'function');
  });
  it('unlink', () => {
    assert.equal(typeof unlink, 'function');
  });
});
