#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adrDir = path.join(__dirname, '..', 'docs', 'adr');

function getNextAdrNumber() {
  const files = fs.readdirSync(adrDir);
  const adrFiles = files.filter(file => file.startsWith('ADR-') && file.endsWith('.md'));
  
  if (adrFiles.length === 0) return 1;
  
  const numbers = adrFiles.map(file => {
    const match = file.match(/ADR-(\d+)/);
    return match ? parseInt(match[1]) : 0;
  });
  
  return Math.max(...numbers) + 1;
}

function createAdrContent(number, title) {
  const date = new Date().toISOString().split('T')[0];
  
  return `# ADR-${number.toString().padStart(3, '0')}: ${title}

## Estado
Propuesto

## Fecha
${date}

## Contexto
[Describir el problema o situación que requiere una decisión]

## Decisión
[Describir la decisión tomada]

## Consecuencias
### Positivas
- [Beneficios de la decisión]

### Negativas
- [Desventajas o riesgos]

### Neutrales
- [Aspectos neutros]

## Alternativas Consideradas
- [Alternativa 1: Descripción y por qué no se eligió]
- [Alternativa 2: Descripción y por qué no se eligió]

## Referencias
- [Enlaces a documentación, RFCs, etc.]
`;
}

function main() {
  const title = process.argv[2];
  
  if (!title) {
    console.error('Uso: node adr-new.mjs "Título del ADR"');
    process.exit(1);
  }
  
  const number = getNextAdrNumber();
  const filename = `ADR-${number.toString().padStart(3, '0')}-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.md`;
  const filepath = path.join(adrDir, filename);
  
  const content = createAdrContent(number, title);
  
  fs.writeFileSync(filepath, content);
  
  console.log(`✅ ADR creado: ${filename}`);
  console.log(`📁 Ubicación: ${filepath}`);
  console.log(`🔗 Enlace: docs/adr/${filename}`);
}

main();
