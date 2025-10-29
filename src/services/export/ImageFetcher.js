export class ImageFetcher {
  static getImageFilename(meterName, date) {
    const meterPrefix = meterName === 'Pianterreno' ? 'p0' :
                        meterName === 'Piano 1' ? 'p1' :
                        meterName === 'Piano 2' ? 'p2' : 'unknown';
    
    const dateString = date.replace(/-/g, '');
    const basePath = process.env.PUBLIC_URL || '';
    return `${basePath}/crack_images/${meterPrefix}_${dateString}.jpg`;
  }
  
  static async fetchAllImages(processedData) {
    const images = {};
    const imageFiles = [];
    
    processedData.forEach(row => {
      if (row.rawPianterreno) {
        const filename = this.getImageFilename('Pianterreno', row.date);
        imageFiles.push({ path: filename, filename: filename.split('/').pop() });
      }
      if (row.rawPiano1) {
        const filename = this.getImageFilename('Piano 1', row.date);
        imageFiles.push({ path: filename, filename: filename.split('/').pop() });
      }
      if (row.rawPiano2) {
        const filename = this.getImageFilename('Piano 2', row.date);
        imageFiles.push({ path: filename, filename: filename.split('/').pop() });
      }
    });
    
    // Fetch each image
    for (const file of imageFiles) {
      try {
        const response = await fetch(file.path);
        if (response.ok) {
          const blob = await response.blob();
          images[file.filename] = blob;
        }
      } catch (error) {
        console.warn(`Could not fetch image: ${file.filename}`);
      }
    }
    
    return images;
  }
}