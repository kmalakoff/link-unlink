import fs from 'fs';
import path from 'path';
import access from 'fs-access-compat';
import { link } from 'link-unlink';
import mkdirp from 'mkdirp-classic';
import Queue from 'queue-cb';

function linkBin(src, binPath, nodeModules, binName, callback) {
  const binFullPath = path.resolve.apply(null, [src, ...binPath.split('/')]);
  const destBin = path.resolve(nodeModules, '.bin', binName);

  access(binFullPath, (err) => {
    if (!err) return link(binFullPath, destBin, callback);
    console.log(`bin not found: ${binFullPath}. Skipping`);
    callback();
  });
}

function worker(src, nodeModules, _options, callback) {
  const pkg = JSON.parse(fs.readFileSync(path.join(src, 'package.json'), 'utf8'));
  const dest = path.resolve.apply(null, [nodeModules, ...pkg.name.split('/')]);

  mkdirp(path.dirname(dest), (err) => {
    if (err) return callback(err);

    const queue = new Queue();
    queue.defer(link.bind(null, src, dest));

    if (typeof pkg.bin === 'string')
      queue.defer(linkBin.bind(null, src, pkg.bin, nodeModules, pkg.name)); // single bins
    else for (const binName in pkg.bin) queue.defer(linkBin.bind(null, src, pkg.bin[binName], nodeModules, binName)); // object of bins

    queue.await((err) => {
      err ? callback(err) : callback(null, dest);
    });
  });
}

import type { LinkCallback, LinkOptions } from './types.js';

export default function linkModule(src: string, nodeModules: string, options?: LinkOptions | LinkCallback, callback?: LinkCallback): undefined | Promise<string> {
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
