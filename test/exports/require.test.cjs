const assert = require('assert');
const { link, unlink } = require('link-unlink');
const linkUnlink = require('link-unlink');

describe('exports .cjs', () => {
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
