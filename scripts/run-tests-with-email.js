/**
 * Script para ejecutar todas las pruebas y enviar reporte por email
 *
 * Este script ejecuta las pruebas unitarias, E2E y de contrato,
 * captura los resultados y los envía por email a admin@aiquaa.com
 *
 * Uso:
 *   node scripts/run-tests-with-email.js [tipo]
 *
 * Tipos disponibles:
 *   - unit: Solo pruebas unitarias
 *   - e2e: Solo pruebas E2E
 *   - contract: Solo pruebas de contrato
 *   - all: Todas las pruebas (por defecto)
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuración
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const TEST_TYPE = process.argv[2] || 'all';

// Función para ejecutar comando y capturar salida
function runCommand(command, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';

    console.log(`\n📋 Ejecutando: ${command}`);
    console.log(`📁 En directorio: ${cwd}`);

    const child = exec(command, { cwd, maxBuffer: 10 * 1024 * 1024 });

    child.stdout.on('data', (data) => {
      stdout += data;
      process.stdout.write(data);
    });

    child.stderr.on('data', (data) => {
      stderr += data;
      process.stderr.write(data);
    });

    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      resolve({
        success: code === 0,
        stdout,
        stderr,
        duration,
        exitCode: code
      });
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Parsear resultados de Jest (pruebas unitarias backend)
function parseJestResults(output) {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    coverage: null,
    failures: []
  };

  try {
    // Buscar resumen de tests
    const testMatch = output.match(/Tests:\s+(\d+)\s+failed.*?(\d+)\s+passed.*?(\d+)\s+total/);
    if (testMatch) {
      results.failed = parseInt(testMatch[1]) || 0;
      results.passed = parseInt(testMatch[2]) || 0;
      results.total = parseInt(testMatch[3]) || 0;
      results.skipped = results.total - results.passed - results.failed;
    } else {
      // Formato alternativo
      const passedMatch = output.match(/Tests:\s+(\d+)\s+passed/);
      if (passedMatch) {
        results.passed = parseInt(passedMatch[1]);
        results.total = results.passed;
      }
    }

    // Buscar cobertura
    const stmtsMatch = output.match(/Stmts\s*:\s*([\d.]+)%/);
    const branchMatch = output.match(/Branch\s*:\s*([\d.]+)%/);
    const funcsMatch = output.match(/Funcs\s*:\s*([\d.]+)%/);
    const linesMatch = output.match(/Lines\s*:\s*([\d.]+)%/);

    if (stmtsMatch || linesMatch) {
      results.coverage = {
        statements: stmtsMatch ? parseFloat(stmtsMatch[1]) : 0,
        branches: branchMatch ? parseFloat(branchMatch[1]) : 0,
        functions: funcsMatch ? parseFloat(funcsMatch[1]) : 0,
        lines: linesMatch ? parseFloat(linesMatch[1]) : 0
      };
    }

    // Buscar fallos
    const failureRegex = /FAIL\s+(.+?)\n([\s\S]*?)(?=\n\s*FAIL|\n\s*Test Suites:|\n\s*$)/g;
    let match;
    while ((match = failureRegex.exec(output)) !== null) {
      const testFile = match[1].trim();
      const errorSection = match[2];

      // Extraer mensajes de error específicos
      const errorLines = errorSection.split('\n')
        .filter(line => line.includes('●') || line.includes('Expected') || line.includes('Received'))
        .slice(0, 5)
        .join('\n');

      if (errorLines) {
        results.failures.push({
          test: testFile,
          error: errorLines.substring(0, 500)
        });
      }
    }

  } catch (error) {
    console.error('Error parseando resultados de Jest:', error);
  }

  return results;
}

// Parsear resultados de Vitest (pruebas unitarias frontend)
function parseVitestResults(output) {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    coverage: null,
    failures: []
  };

  try {
    // Buscar resumen de tests
    const testMatch = output.match(/Test Files\s+(\d+)\s+passed.*?(\d+)\s+total/);
    if (testMatch) {
      results.passed = parseInt(testMatch[1]) || 0;
      results.total = parseInt(testMatch[2]) || 0;
    }

    const testsMatch = output.match(/Tests\s+(\d+)\s+passed/);
    if (testsMatch) {
      results.passed = parseInt(testsMatch[1]) || 0;
    }

    // Buscar cobertura
    const coverageMatch = output.match(/All files\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)/);
    if (coverageMatch) {
      results.coverage = {
        statements: parseFloat(coverageMatch[1]),
        branches: parseFloat(coverageMatch[2]),
        functions: parseFloat(coverageMatch[3]),
        lines: parseFloat(coverageMatch[4])
      };
    }

  } catch (error) {
    console.error('Error parseando resultados de Vitest:', error);
  }

  return results;
}

// Parsear resultados de Playwright (E2E)
function parsePlaywrightResults(output) {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    coverage: null,
    failures: []
  };

  try {
    // Buscar resumen
    const passedMatch = output.match(/(\d+)\s+passed/);
    const failedMatch = output.match(/(\d+)\s+failed/);
    const skippedMatch = output.match(/(\d+)\s+skipped/);

    results.passed = passedMatch ? parseInt(passedMatch[1]) : 0;
    results.failed = failedMatch ? parseInt(failedMatch[1]) : 0;
    results.skipped = skippedMatch ? parseInt(skippedMatch[1]) : 0;
    results.total = results.passed + results.failed + results.skipped;

    // Buscar fallos
    const failureRegex = /\d+\)\s+(.+?)\s+─+\n([\s\S]*?)(?=\n\s*\d+\)|\n\s*$)/g;
    let match;
    while ((match = failureRegex.exec(output)) !== null) {
      results.failures.push({
        test: match[1].trim(),
        error: match[2].trim().substring(0, 500)
      });
    }

  } catch (error) {
    console.error('Error parseando resultados de Playwright:', error);
  }

  return results;
}

// Ejecutar pruebas unitarias
async function runUnitTests() {
  console.log('\n🧪 Ejecutando pruebas unitarias del backend...');

  const backendResult = await runCommand(
    'pnpm test:cov',
    path.join(__dirname, '..', 'apps', 'backend')
  );

  const backendParsed = parseJestResults(backendResult.stdout + backendResult.stderr);

  console.log('\n🧪 Ejecutando pruebas unitarias del frontend...');

  const frontendResult = await runCommand(
    'pnpm test:cov',
    path.join(__dirname, '..', 'apps', 'frontend')
  );

  const frontendParsed = parseVitestResults(frontendResult.stdout + frontendResult.stderr);

  // Combinar resultados
  return {
    success: backendResult.success && frontendResult.success,
    duration: backendResult.duration + frontendResult.duration,
    summary: {
      total: backendParsed.total + frontendParsed.total,
      passed: backendParsed.passed + frontendParsed.passed,
      failed: backendParsed.failed + frontendParsed.failed,
      skipped: backendParsed.skipped + frontendParsed.skipped
    },
    coverage: backendParsed.coverage || frontendParsed.coverage,
    failures: [...backendParsed.failures, ...frontendParsed.failures]
  };
}

// Ejecutar pruebas E2E
async function runE2ETests() {
  console.log('\n🌐 Ejecutando pruebas E2E...');

  const result = await runCommand(
    'pnpm e2e',
    path.join(__dirname, '..', 'apps', 'frontend')
  );

  const parsed = parsePlaywrightResults(result.stdout + result.stderr);

  return {
    success: result.success,
    duration: result.duration,
    summary: parsed,
    coverage: null,
    failures: parsed.failures
  };
}

// Ejecutar pruebas de contrato
async function runContractTests() {
  console.log('\n📋 Ejecutando pruebas de contrato...');

  const result = await runCommand(
    'pnpm test:contract',
    path.join(__dirname, '..', 'apps', 'backend')
  );

  const parsed = parseJestResults(result.stdout + result.stderr);

  return {
    success: result.success,
    duration: result.duration,
    summary: parsed,
    coverage: null,
    failures: parsed.failures
  };
}

// Enviar resultados por email
async function sendEmailReport(testResults, type) {
  console.log('\n📧 Enviando reporte por email...');

  const payload = {
    ...testResults,
    timestamp: new Date(),
    type: type
  };

  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/mailer/test-results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Email enviado exitosamente:', data);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email:', error.message);
    return false;
  }
}

// Función principal
async function main() {
  console.log('🚀 AIQUAA - Ejecutor de Pruebas con Reporte por Email');
  console.log('=' .repeat(60));
  console.log(`📊 Tipo de pruebas: ${TEST_TYPE}`);
  console.log(`🔗 Backend URL: ${BACKEND_URL}`);
  console.log('=' .repeat(60));

  const startTime = Date.now();
  let testResults = null;
  let type = TEST_TYPE;

  try {
    switch (TEST_TYPE) {
      case 'unit':
        testResults = await runUnitTests();
        break;

      case 'e2e':
        testResults = await runE2ETests();
        break;

      case 'contract':
        testResults = await runContractTests();
        break;

      case 'all':
      default:
        console.log('\n📦 Ejecutando TODAS las pruebas...\n');

        const [unit, e2e, contract] = await Promise.allSettled([
          runUnitTests(),
          runE2ETests(),
          runContractTests()
        ]);

        const unitResults = unit.status === 'fulfilled' ? unit.value : null;
        const e2eResults = e2e.status === 'fulfilled' ? e2e.value : null;
        const contractResults = contract.status === 'fulfilled' ? contract.value : null;

        // Combinar todos los resultados
        testResults = {
          success: unitResults?.success && e2eResults?.success && contractResults?.success,
          duration: (unitResults?.duration || 0) + (e2eResults?.duration || 0) + (contractResults?.duration || 0),
          summary: {
            total: (unitResults?.summary.total || 0) + (e2eResults?.summary.total || 0) + (contractResults?.summary.total || 0),
            passed: (unitResults?.summary.passed || 0) + (e2eResults?.summary.passed || 0) + (contractResults?.summary.passed || 0),
            failed: (unitResults?.summary.failed || 0) + (e2eResults?.summary.failed || 0) + (contractResults?.summary.failed || 0),
            skipped: (unitResults?.summary.skipped || 0) + (e2eResults?.summary.skipped || 0) + (contractResults?.summary.skipped || 0)
          },
          coverage: unitResults?.coverage || null,
          failures: [
            ...(unitResults?.failures || []),
            ...(e2eResults?.failures || []),
            ...(contractResults?.failures || [])
          ]
        };
        type = 'all';
        break;
    }

    const totalTime = Date.now() - startTime;

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN FINAL');
    console.log('='.repeat(60));
    console.log(`✅ Pruebas pasadas: ${testResults.summary.passed}`);
    console.log(`❌ Pruebas fallidas: ${testResults.summary.failed}`);
    console.log(`⊘  Pruebas omitidas: ${testResults.summary.skipped}`);
    console.log(`📝 Total de pruebas: ${testResults.summary.total}`);
    console.log(`⏱️  Tiempo total: ${(totalTime / 1000).toFixed(2)}s`);
    console.log(`📈 Estado: ${testResults.success ? '✅ EXITOSO' : '❌ FALLIDO'}`);

    if (testResults.coverage) {
      console.log('\n📊 Cobertura de Código:');
      console.log(`  Statements: ${testResults.coverage.statements.toFixed(2)}%`);
      console.log(`  Branches: ${testResults.coverage.branches.toFixed(2)}%`);
      console.log(`  Functions: ${testResults.coverage.functions.toFixed(2)}%`);
      console.log(`  Lines: ${testResults.coverage.lines.toFixed(2)}%`);
    }
    console.log('='.repeat(60));

    // Enviar email
    const emailSent = await sendEmailReport(testResults, type);

    if (emailSent) {
      console.log('\n✅ Proceso completado exitosamente');
      console.log('📧 Revisa tu email en admin@aiquaa.com');
    } else {
      console.log('\n⚠️  Pruebas completadas pero el email no se pudo enviar');
    }

    // Exit code basado en si las pruebas pasaron
    process.exit(testResults.success ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Error ejecutando pruebas:', error);
    process.exit(1);
  }
}

// Ejecutar
main();
