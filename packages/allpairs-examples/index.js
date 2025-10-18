import carColorsJson from './data/car-colors.json' assert { type: 'json' };
import browserOsJson from './data/browser-os.json' assert { type: 'json' };
import tenByTenJson from './data/10x10.json' assert { type: 'json' };
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Export JSON examples directly
export const examples = {
  carColors: carColorsJson,
  browserOs: browserOsJson,
  tenByTen: tenByTenJson,
};

// Helper to read YAML files
export function readYamlExample(name) {
  const yamlPath = path.join(__dirname, 'data', `${name}.yml`);
  return fs.readFileSync(yamlPath, 'utf-8');
}

// Export metadata
export const exampleMetadata = [
  {
    id: 'car-colors',
    name: 'Car Colors',
    description: 'Test combinations of car year, color, and model',
    file: 'car-colors',
  },
  {
    id: 'browser-os',
    name: 'Browser & OS',
    description: 'Browser compatibility testing across operating systems',
    file: 'browser-os',
  },
  {
    id: '10x10',
    name: '10x10 Parameters',
    description: 'Large dataset with 10 parameters, 10 values each',
    file: '10x10',
  },
];
