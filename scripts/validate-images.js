const fs = require('fs');
const path = require('path');

// Read crack data
const crackData = require('../src/data/crackData.json');

// Image directory
const imageDir = path.join(__dirname, '../public/crack_images');

// Extensions that can be safely renamed to .jpg (same format)
const jpegExtensions = ['.jpg', '.JPG', '.jpeg', '.JPEG'];

// Extensions that need manual conversion (different format)
const otherExtensions = ['.png', '.PNG', '.webp', '.WEBP'];

// Floor name to code mapping
const floorCodeMap = {
  'Pianterreno': 'p0',
  'Piano 1': 'p1',
  'Piano 2': 'p2'
};

let missingImages = [];
let foundImages = [];
let renamedImages = [];
let conversionNeeded = [];

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
      const correctImageName = `${expectedImageBase}.jpg`;
      const correctImagePath = path.join(imageDir, correctImageName);
      
      // Check if correct image already exists
      if (fs.existsSync(correctImagePath)) {
        foundImages.push(correctImageName);
        return; // All good, move to next
      }
      
      // Look for JPEG variants (can be safely renamed)
      let jpegFound = false;
      let foundExt = null;
      let foundPath = null;
      
      for (const ext of jpegExtensions) {
        if (ext === '.jpg') continue; // Already checked above
        
        const imagePath = path.join(imageDir, expectedImageBase + ext);
        if (fs.existsSync(imagePath)) {
          jpegFound = true;
          foundExt = ext;
          foundPath = imagePath;
          break;
        }
      }
      
      if (jpegFound) {
        // Safe to rename - same format, just different extension
        try {
          fs.renameSync(foundPath, correctImagePath);
          renamedImages.push({
            from: `${expectedImageBase}${foundExt}`,
            to: correctImageName
          });
          foundImages.push(correctImageName);
          console.log(`  🔧 Renamed: ${expectedImageBase}${foundExt} → ${correctImageName}`);
        } catch (error) {
          console.error(`  ❌ Failed to rename ${expectedImageBase}${foundExt}: ${error.message}`);
          missingImages.push({
            floor: floorName,
            date: date,
            expectedName: correctImageName,
            reading: reading,
            error: `Found ${expectedImageBase}${foundExt} but failed to rename`
          });
        }
        return;
      }
      
      // Look for other formats (need conversion)
      let otherFound = false;
      let otherExt = null;
      
      for (const ext of otherExtensions) {
        const imagePath = path.join(imageDir, expectedImageBase + ext);
        if (fs.existsSync(imagePath)) {
          otherFound = true;
          otherExt = ext;
          break;
        }
      }
      
      if (otherFound) {
        // Found image but wrong format - needs manual conversion
        conversionNeeded.push({
          floor: floorName,
          date: date,
          foundFile: `${expectedImageBase}${otherExt}`,
          needsFile: correctImageName,
          reading: reading
        });
      } else {
        // No image found at all
        missingImages.push({
          floor: floorName,
          date: date,
          expectedName: correctImageName,
          reading: reading
        });
      }
    }
  });
});

// Report results
console.log('\n📊 Crack Image Validation Report\n');
console.log(`✅ Found images: ${foundImages.length}`);
console.log(`🔧 Renamed images: ${renamedImages.length}`);
console.log(`🔄 Need conversion: ${conversionNeeded.length}`);
console.log(`❌ Missing images: ${missingImages.length}\n`);

if (renamedImages.length > 0) {
  console.log('Renamed images to correct format (.jpg):');
  renamedImages.forEach(item => {
    console.log(`  🔧 ${item.from} → ${item.to}`);
  });
  console.log('');
}

if (conversionNeeded.length > 0) {
  console.log('❌ Images found but need format conversion:\n');
  conversionNeeded.forEach(item => {
    console.log(`  🔄 ${item.floor} - ${item.date}`);
    console.log(`     Found: public/crack_images/${item.foundFile}`);
    console.log(`     Needs: public/crack_images/${item.needsFile}`);
    console.log(`     Action: Convert ${item.foundFile.split('.').pop().toUpperCase()} to JPG format`);
    console.log('');
  });
}

if (missingImages.length > 0) {
  console.log('❌ Missing images for the following readings:\n');
  missingImages.forEach(item => {
    console.log(`  ❌ ${item.floor} - ${item.date}`);
    console.log(`     Expected: public/crack_images/${item.expectedName}`);
    console.log(`     Reading: ${item.reading}`);
    if (item.error) {
      console.log(`     Error: ${item.error}`);
    }
    console.log('');
  });
}

// Fail if there are missing images or images that need conversion
if (missingImages.length > 0 || conversionNeeded.length > 0) {
  if (conversionNeeded.length > 0) {
    console.log('\n💡 How to convert images to JPG:');
    console.log('   • macOS: Open in Preview → File → Export → Format: JPEG');
    console.log('   • Windows: Open in Paint → Save As → JPEG');
    console.log('   • Command line: brew install imagemagick && magick convert input.png output.jpg\n');
  }
  process.exit(1);
} else {
  console.log('✅ All crack readings have corresponding images in correct format!\n');
  process.exit(0);
}