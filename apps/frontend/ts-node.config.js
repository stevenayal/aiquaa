module.exports = {
  'ts-node': {
    transpileOnly: true,
    compilerOptions: {
      module: 'commonjs',
      target: 'es2020',
      moduleResolution: 'node',
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      types: ['node', 'chai']
    }
  }
};