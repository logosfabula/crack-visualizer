import JSZip from 'jszip';
import { JSONFormatter } from './formatters/JSONFormatter';
import { CSVFormatter } from './formatters/CSVFormatter';
import { YAMLFormatter } from './formatters/YAMLFormatter';
import { XLSXFormatter } from './formatters/XLSXFormatter';
import { DataPreparer } from './DataPreparer';
import { ImageFetcher } from './ImageFetcher';

export class ExportService {
  static formatters = {
    json: JSONFormatter,
    csv: CSVFormatter,
    yaml: YAMLFormatter,
    xlsx: XLSXFormatter
  };
  
  static async downloadDataset(processedData, format, includeImages) {
    try {
      // Prepare data
      const data = DataPreparer.prepare(processedData, includeImages);
      
      // Get formatter
      const formatter = this.formatters[format];
      if (!formatter) {
        throw new Error(`Unsupported format: ${format}`);
      }
      
      // Format data
      const formattedData = formatter.format(data);
      const mimeType = formatter.getMimeType();
      const extension = formatter.getExtension();
      
      // Create blob
      const dataBlob = new Blob([formattedData], { type: mimeType });
      
      // Generate timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      
      if (includeImages) {
        // Create ZIP with data + images
        const zip = new JSZip();
        
        // Add data file
        zip.file(`crack_data_${timestamp}.${extension}`, dataBlob);
        
        // Fetch and add images
        const images = await ImageFetcher.fetchAllImages(processedData);
        const imageFolder = zip.folder('crack_images');
        
        Object.keys(images).forEach(filename => {
          imageFolder.file(filename, images[filename]);
        });
        
        // Generate and download ZIP
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        this.triggerDownload(zipBlob, `crack_dataset_${timestamp}.zip`);
      } else {
        // Download just the data file
        this.triggerDownload(dataBlob, `crack_data_${timestamp}.${extension}`);
      }
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }
  
  static triggerDownload(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
  
  static downloadImage(meterName, date) {
    const imagePath = ImageFetcher.getImageFilename(meterName, date);
    const filename = imagePath.split('/').pop();
    
    const link = document.createElement('a');
    link.href = imagePath;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}