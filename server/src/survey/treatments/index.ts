import fs from 'fs';
import path from 'path';

const treatments = fs
  .readdirSync(__dirname)
  .filter((file) => {
    if (file.startsWith('index.')) return false;
    return /\.treatment\.(js|ts)$/.test(file);
  })
  .reduce<Record<string, unknown>>((acc, file) => {
    const loaded = require(path.join(__dirname, file));
    const treatmentModule = loaded.default ?? loaded;
    return { ...acc, ...treatmentModule };
  }, {});

export = treatments;
