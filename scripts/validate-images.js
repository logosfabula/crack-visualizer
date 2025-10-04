const fs = require('fs');
const path = require('path');

// Read crack data
const crackData = require('../src/data/crackData.json');

// Image directory
const imageDir = path.join(__dirname, '../public/crack_images');

// Supported image extensions
const imageExtensions = ['.jpg', '.jpeg', '.png'];

// Floor name to code mapping
const floorCodeMap = {
  'Pianterreno': 'p0',
  'Piano 1': 'p1',
  'Piano 2': 'p2'
};

let missingImages = [];
let foundImages = [];

// Check each entry
crackData.forEach(entry => {
  const date = entry.date; // Format: "2024-06-20"
  const dateFormatted = date.replace(/-/g, ''); // Convert to: "20240620"
  
  // Check each floor
  Object.keys(floorCodeMap).forEach(floorName => {
    const reading = entry[floorName];
    
    // If there's a reading for this floor on this date
    if (reading && reading !== null) {
      const floorCode = floorCodeMap[floorName];
      const expectedImageBase = `${floorCode}_${dateFormatted}`;
      
      // Check if image exists with any supported extension
      let imageFound = false;
      let foundExt = null;
      
      for (const ext of imageExtensions) {
        const imagePath = path.join(imageDir, expectedImageBase + ext);
        if (fs.existsSync(imagePath)) {
          imageFound = true;
          foundExt = ext;
          break;
        }
      }
      
      if (imageFound) {
        foundImages.push(`${expectedImageBase}${foundExt}`);
      } else {
        missingImages.push({
          floor: floorName,
          date: date,
          expectedName: `${expectedImageBase}.{jpg|png|jpeg}`,
          reading: reading
        });
      }
    }
  });
});

// Report results
console.log('\n📊 Crack Image Validation Report\n');
console.log(`✅ Found images: ${foundImages.length}`);
console.log(`❌ Missing images: ${missingImages.length}\n`);

if (foundImages.length > 0) {
  console.log('Found images:');
  foundImages.forEach(img => console.log(`  ✅ ${img}`));
  console.log('');
}

if (missingImages.length > 0) {
  console.log('Missing images for the following readings:\n');
  missingImages.forEach(item => {
    console.log(`  ❌ ${item.floor} - ${item.date}`);
    console.log(`     Expected: public/crack_images/${item.expectedName}`);
    console.log(`     Reading: ${item.reading}\n`);
  });
  
  process.exit(1); // Fail the workflow
} else {
  console.log('✅ All crack readings have corresponding images!\n');
  process.exit(0);
}