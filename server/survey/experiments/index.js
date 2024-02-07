const fs = require('fs');
const path = require('path');

const experiments = {};

fs.readdirSync(__dirname).forEach((file) => {
    if (file !== 'index.js' && file.endsWith('.js')) {
        const moduleName = path.basename(file, '.js');
        experiments[moduleName] = require(`./${file}`);
    }
});

module.exports = experiments;