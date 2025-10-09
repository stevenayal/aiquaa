module.exports = {
  require: [
    'test/**/*.steps.ts'
  ],
  requireModule: ['ts-node/register'],
  format: [
    'progress-bar',
    'html:test-results/cucumber-report.html'
  ],
  paths: ['test/**/*.feature'],
  parallel: 1,
  publishQuiet: true,
  retry: 1,
  timeout: 30000
};