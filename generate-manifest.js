const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'src', 'assets', 'cards');
const manifestPath = path.join(__dirname, 'src', 'assets', 'cards', 'cards_manifest.json');

fs.readdir(assetsDir, (err, files) => {
  if (err) {
    console.error('Error leyendo el directorio de assets:', err);
    return;
  }

  const jsonFiles = files.filter(file => file.endsWith('.json') && file !== 'cards_manifest.json');
  const jsonFilePaths = jsonFiles.map(file => `assets/cards/${file}`);

  fs.writeFile(manifestPath, JSON.stringify(jsonFilePaths, null, 2), (writeErr) => {
    if (writeErr) {
      console.error('Error escribiendo el archivo manifest:', writeErr);
      return;
    }
    console.log(`Manifest de ${jsonFilePaths.length} archivos JSON generado en: ${manifestPath}`);
  });
});