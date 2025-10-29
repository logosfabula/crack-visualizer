export class JSONFormatter {
  static format(data) {
    return JSON.stringify(data, null, 2);
  }
  
  static getExtension() {
    return 'json';
  }
  
  static getMimeType() {
    return 'application/json';
  }
}