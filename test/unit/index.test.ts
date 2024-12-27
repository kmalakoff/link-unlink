// remove NODE_OPTIONS from ts-dev-stack
delete process.env.NODE_OPTIONS;

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import url from 'url';
import existsSync from 'fs-exists-sync';
// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import Promise from 'pinkie-promise';
import rimraf2 from 'rimraf2';

// @ts-ignore
import { link, unlink } from 'link-unlink';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const DATA = path.resolve(__dirname, '..', 'data');
const TMP_DIR = path.resolve(__dirname, '..', '..', '.tmp');

describe('link-unlink', () => {
  before(rimraf2.bind(null, TMP_DIR, { disableGlob: true }));
  // after(rimraf2.bind(null, TMP_DIR, { disableGlob: true }));

  function addTests({ name, type }) {
    function isType(stat) {
      return type === 'file' ? stat.isFile() : stat.isDirectory();
    }
    function checkFiles(files, count) {
      assert.equal(files.length, count);

      files.forEach((file) => {
        // correct types
        const lstat = fs.lstatSync(path.join(TMP_DIR, file));
        assert.ok(lstat.isSymbolicLink());
        const stat = fs.statSync(path.join(TMP_DIR, file));
        assert.ok(isType(stat));
        if (type === 'dir') {
          assert.equal(existsSync(path.join(TMP_DIR, file, 'file.js')), true);
        }
      });
    }

    describe(name, () => {
      const root = typeof global !== 'undefined' ? global : window;
      let rootPromise: Promise;
      before(() => {
        rootPromise = root.Promise;
        root.Promise = Promise;
      });
      after(() => {
        root.Promise = rootPromise;
      });

      it('link', (done) => {
        const source = path.resolve(DATA, '..', 'data', name);
        const dest = path.resolve(TMP_DIR, name);
        assert.equal(existsSync(dest), false);

        link(source, dest, (err, restore) => {
          assert.ok(!err, err ? err.message : '');
          assert.equal(restore, dest);
          assert.equal(existsSync(dest), true);
          checkFiles(fs.readdirSync(TMP_DIR), 1);

          // correct types
          const lstat = fs.lstatSync(dest);
          assert.ok(lstat.isSymbolicLink());
          const stat = fs.statSync(dest);
          assert.ok(isType(stat));

          unlink(dest, (err) => {
            assert.ok(!err, err ? err.message : '');
            assert.equal(existsSync(dest), false);
            assert.equal(fs.readdirSync(TMP_DIR).length, 0);
            done();
          });
        });
      });

      it('link (promise)', async () => {
        const source = path.resolve(DATA, '..', 'data', name);
        const dest = path.resolve(TMP_DIR, name);
        assert.equal(existsSync(dest), false);

        const restore = await link(source, dest);
        assert.equal(restore, dest);
        assert.equal(existsSync(dest), true);
        checkFiles(fs.readdirSync(TMP_DIR), 1);

        // correct types
        const lstat = fs.lstatSync(dest);
        assert.ok(lstat.isSymbolicLink());
        const stat = fs.statSync(dest);
        assert.ok(isType(stat));

        await unlink(dest);
        assert.equal(existsSync(dest), false);
        assert.equal(fs.readdirSync(TMP_DIR).length, 0);
      });

      it('link multiple', (done) => {
        const source = path.resolve(DATA, '..', 'data', name);
        const dest = path.resolve(TMP_DIR, name);
        assert.equal(existsSync(dest), false);

        link(source, dest, (err) => {
          assert.ok(!err, err ? err.message : '');

          link(source, dest, (err) => {
            assert.ok(!err, err ? err.message : '');

            link(source, dest, (err) => {
              assert.ok(!err, err ? err.message : '');

              assert.equal(existsSync(dest), true);
              checkFiles(fs.readdirSync(TMP_DIR), 3);

              unlink(dest, (err) => {
                assert.ok(!err, err ? err.message : '');
                assert.equal(existsSync(dest), true);
                checkFiles(fs.readdirSync(TMP_DIR), 2);

                unlink(dest, (err) => {
                  assert.ok(!err, err ? err.message : '');
                  assert.equal(existsSync(dest), true);
                  checkFiles(fs.readdirSync(TMP_DIR), 1);

                  unlink(dest, (err) => {
                    assert.ok(!err, err ? err.message : '');
                    assert.equal(existsSync(dest), false);
                    assert.equal(fs.readdirSync(TMP_DIR).length, 0);
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });
  }

  addTests({ name: 'test-folder', type: 'dir' });
  addTests({ name: 'test-file.js', type: 'file' });
});