import fs from 'fs';
import { Lock } from 'lock';
import mkdirp from 'mkdirp-classic';
import path from 'path';
import tempSuffix from 'temp-suffix';

const lock = Lock();

const isWindows = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE);
const dirSymlinkType = isWindows ? 'junction' : 'dir';

function saveLink(target, callback) {
  const movedPath = path.join(path.dirname(target), `${path.basename(target)}.${tempSuffix()}`);
  fs.rename(target, movedPath, callback);
}

function createLink(src, target, callback) {
  fs.stat(src, (err, stat) => {
    if (err) return callback(err);

    mkdirp(path.dirname(target), () => {
      fs.symlink(src, target, stat.isFile() ? 'file' : dirSymlinkType, (err) => {
        if (!err) return callback(null, target);

        // already exists, move and try to link again
        return saveLink(target, (err) => {
          err ? callback(err) : createLink(src, target, callback);
        });
      });
    });
  });
}

function worker(src, target, callback) {
  lock([src, target], (release) => {
    callback = release(callback);
    fs.stat(target, (_, stat) => {
      // doesn't exist, create
      if (!stat) return createLink(src, target, callback);
      // exists so move it
      return saveLink(target, (err) => {
        err ? callback(err) : createLink(src, target, callback);
      });
    });
  });
}

import type { LinkCallback } from './types.js';

export default function link(src: string, target: string, callback?: undefined | LinkCallback): undefined | Promise<string> {
  if (typeof callback === 'function') return worker(src, target, callback) as undefined;
  return new Promise((resolve, reject) => worker(src, target, (err, restore) => (err ? reject(err) : resolve(restore))));
}
