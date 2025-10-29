import * as XLSX from 'xlsx';

export class XLSXFormatter {
  static format(data) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Crack Data');
    
    // Generate binary array
    return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  }
  
  static getExtension() {
    return 'xlsx';
  }
  
  static getMimeType() {
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }
}