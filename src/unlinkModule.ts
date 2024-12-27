import fs from 'fs';
import path from 'path';
import access from 'fs-access-compat';
import { unlink } from 'link-unlink';
import Queue from 'queue-cb';

function unlinkBin(nodeModules, binName, callback) {
  const destBin = path.resolve(nodeModules, '.bin', binName);

  access(destBin, (err) => {
    if (!err) return unlink(destBin, callback);
    console.log(`bin not found: ${destBin}. Skipping`);
    callback();
  });
}

function worker(src, nodeModules, _options, callback) {
  const pkg = JSON.parse(fs.readFileSync(path.join(src, 'package.json'), 'utf8'));
  const dest = path.resolve.apply(null, [nodeModules, ...pkg.name.split('/')]);

  const queue = new Queue(1);
  queue.defer(unlink.bind(null, dest));

  if (typeof pkg.bin === 'string')
    queue.defer(unlinkBin.bind(null, nodeModules, pkg.name)); // single bins
  else for (const binName in pkg.bin) queue.defer(unlinkBin.bind(null, nodeModules, binName)); // object of bins

  queue.await((err) => {
    err ? callback(err) : callback(null, dest);
  });
}

import type { UnlinkCallback, UnlinkOptions } from './types.js';

export default function unlinkModule(src: string, nodeModules: string, options?: UnlinkOptions | UnlinkCallback, callback?: UnlinkCallback): undefined | Promise<string> {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};

  if (typeof callback === 'function') return worker(src, nodeModules, options, callback) as undefined;
  return new Promise((resolve, reject) => {
    worker(src, nodeModules, options, (err, restore) => {
      err ? reject(err) : resolve(restore);
    });
  });
}
