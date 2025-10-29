import yaml from 'js-yaml';

export class YAMLFormatter {
  static format(data) {
    return yaml.dump(data);
  }
  
  static getExtension() {
    return 'yaml';
  }
  
  static getMimeType() {
    return 'text/yaml';
  }
}