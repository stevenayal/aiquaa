#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración del monorepo...\n');

const checks = [
  {
    name: 'Package.json root',
    path: 'package.json',
    check: (content) => {
      const pkg = JSON.parse(content);
      return pkg.workspaces && pkg.workspaces.includes('apps/*') && pkg.workspaces.includes('packages/*');
    }
  },
  {
    name: 'Frontend package.json',
    path: 'apps/frontend/package.json',
    check: (content) => {
      const pkg = JSON.parse(content);
      return pkg.name === '@aiquaa/frontend' && pkg.dependencies && pkg.dependencies.next;
    }
  },
  {
    name: 'Backend package.json',
    path: 'apps/backend/package.json',
    check: (content) => {
      const pkg = JSON.parse(content);
      return pkg.name === '@aiquaa/backend' && pkg.dependencies && pkg.dependencies['@nestjs/common'];
    }
  },
  {
    name: 'Shared package.json',
    path: 'packages/shared/package.json',
    check: (content) => {
      const pkg = JSON.parse(content);
      return pkg.name === '@aiquaa/shared';
    }
  },
  {
    name: 'Docker Compose',
    path: 'docker-compose.yml',
    check: (content) => {
      return content.includes('postgres:16-alpine') && content.includes('aiquaa');
    }
  },
  {
    name: 'Makefile',
    path: 'Makefile',
    check: (content) => {
      return content.includes('db-up') && content.includes('dev');
    }
  }
];

let allPassed = true;

checks.forEach(({ name, path: filePath, check }) => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ ${name}: Archivo no encontrado`);
      allPassed = false;
      return;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    if (check(content)) {
      console.log(`✅ ${name}: OK`);
    } else {
      console.log(`❌ ${name}: Configuración incorrecta`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ ${name}: Error - ${error.message}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 ¡Configuración del monorepo verificada exitosamente!');
  console.log('\n📋 Próximos pasos:');
  console.log('1. pnpm install');
  console.log('2. make db-up');
  console.log('3. make db-seed');
  console.log('4. make dev');
} else {
  console.log('⚠️  Se encontraron problemas en la configuración.');
  console.log('Por favor, revisa los errores arriba.');
  process.exit(1);
}
