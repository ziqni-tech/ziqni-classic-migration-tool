const fs = require('fs');
const path = require('path');

function writeFile(entityName, fileName, data) {
  const dataDir = path.join('entitiesData', entityName);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dataFile = path.join(dataDir, `${fileName}.json`);
  fs.writeFileSync(dataFile, JSON.stringify(data));

  console.log(`Data saved to filePath - ${dataFile}`);
}

module.exports = writeFile