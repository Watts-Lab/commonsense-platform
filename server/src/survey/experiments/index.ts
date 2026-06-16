import fs from 'fs';
import path from 'path';

const experiments = fs
  .readdirSync(__dirname)
  .filter((file) => {
    if (file.startsWith('index.')) return false;
    return /\.experiment\.(js|ts)$/.test(file);
  })
  .map((file) => {
    const moduleName = file.replace(/\.(js|ts)$/, '');
    const loaded = require(path.join(__dirname, file));
    const experiment = loaded.default ?? loaded;

    return { name: moduleName, ...experiment };
  });

export default experiments;
