const fs = require('fs');
const path = require('path');

function writeFile(entityName, data) {
  const dataDir = path.join('mutatedData', entityName);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dataFile = path.join(dataDir, `${entityName}s.json`);
  fs.writeFileSync(dataFile, JSON.stringify(data));

  console.log(`Data saved to filePath - ${dataFile}`);
}

module.exports = writeFile