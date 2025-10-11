const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function printOpenAPI() {
  try {
    console.log('🔄 Generating OpenAPI specification...');

    // Build the application first
    console.log('📦 Building application...');
    execSync('pnpm build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

    // Start the application temporarily to generate the OpenAPI spec
    console.log('🚀 Starting application to generate OpenAPI spec...');

    // Create a temporary script to generate the spec
    const tempScript = `
const { NestFactory } = require('@nestjs/core');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
const { AppModule } = require('./dist/app.module');

async function generateOpenAPI() {
  try {
    const app = await NestFactory.create(AppModule, { logger: false });

    const config = new DocumentBuilder()
      .setTitle('AIQUAA API')
      .setDescription('API para la plataforma AIQUAA - Herramientas de QA')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // Write to file
    const fs = require('fs');
    const path = require('path');

    const outputPath = path.join(__dirname, 'openapi.json');
    fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));

    console.log('✅ OpenAPI specification generated successfully!');
    console.log(\`📄 File saved to: \${outputPath}\`);

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating OpenAPI specification:', error);
    process.exit(1);
  }
}

generateOpenAPI();
`;

    const tempScriptPath = path.join(__dirname, '..', 'temp-generate-openapi.js');
    fs.writeFileSync(tempScriptPath, tempScript);

    // Run the temporary script
    execSync(`node ${tempScriptPath}`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });

    // Clean up
    fs.unlinkSync(tempScriptPath);

    // Move the generated file to a better location
    const generatedDir = path.join(__dirname, '..', 'generated');
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }

    const sourcePath = path.join(__dirname, '..', 'openapi.json');
    const destPath = path.join(generatedDir, 'openapi.json');

    if (fs.existsSync(sourcePath)) {
      fs.renameSync(sourcePath, destPath);
      console.log(`📄 OpenAPI spec moved to: ${destPath}`);
    }

    console.log('🎉 OpenAPI specification generation completed!');
    console.log('📚 You can now access the Swagger UI at: http://localhost:3001/api/v1/docs');

  } catch (error) {
    console.error('❌ Error generating OpenAPI specification:', error);
    process.exit(1);
  }
}

printOpenAPI();
