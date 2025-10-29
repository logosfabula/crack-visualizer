import { ImageFetcher } from './ImageFetcher';

export class DataPreparer {
  static prepare(processedData, includeImageFilenames = false) {
    return processedData.map(row => {
      const rowData = {
        // Basic info
        date: row.date,
        
        // Pianterreno
        pianterreno_raw: row.rawPianterreno || '',
        pianterreno_x: row.pianterreno_x?.toFixed(3) || '',
        pianterreno_y: row.pianterreno_y?.toFixed(3) || '',
        pianterreno_norm_x: row.pianterreno_norm_x?.toFixed(3) || '',
        pianterreno_norm_y: row.pianterreno_norm_y?.toFixed(3) || '',
        pianterreno_angles: row.pianterreno_angle_analysis || ''
      };
      
      if (includeImageFilenames) {
        rowData.pianterreno_image = row.rawPianterreno 
          ? ImageFetcher.getImageFilename('Pianterreno', row.date).split('/').pop()
          : '';
      }
      
      // Piano 1
      rowData.piano1_raw = row.rawPiano1 || '';
      rowData.piano1_x = row.piano1_x?.toFixed(3) || '';
      rowData.piano1_y = row.piano1_y?.toFixed(3) || '';
      rowData.piano1_norm_x = row.piano1_norm_x?.toFixed(3) || '';
      rowData.piano1_norm_y = row.piano1_norm_y?.toFixed(3) || '';
      rowData.piano1_angles = row.piano1_angle_analysis || '';
      
      if (includeImageFilenames) {
        rowData.piano1_image = row.rawPiano1 
          ? ImageFetcher.getImageFilename('Piano 1', row.date).split('/').pop()
          : '';
      }
      
      // Piano 2
      rowData.piano2_raw = row.rawPiano2 || '';
      rowData.piano2_x = row.piano2_x?.toFixed(3) || '';
      rowData.piano2_y = row.piano2_y?.toFixed(3) || '';
      rowData.piano2_norm_x = row.piano2_norm_x?.toFixed(3) || '';
      rowData.piano2_norm_y = row.piano2_norm_y?.toFixed(3) || '';
      rowData.piano2_angles = row.piano2_angle_analysis || '';
      
      if (includeImageFilenames) {
        rowData.piano2_image = row.rawPiano2 
          ? ImageFetcher.getImageFilename('Piano 2', row.date).split('/').pop()
          : '';
      }
      
      return rowData;
    });
  }
}