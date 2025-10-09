module.exports = {
  default: {
    require: [
      'test/**/*.steps.ts',
      'test/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:test-results/cucumber-report.html',
      'json:test-results/cucumber-report.json'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    paths: ['test/**/*.feature'],
    parallel: 1,
    publishQuiet: true,
    retry: 2,
    timeout: 30000
  }
};
