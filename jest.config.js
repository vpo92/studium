module.exports = {
  setupFiles: ['./setup-jest.js'],
  coveragePathIgnorePatterns: [
    'node_modules',
    'api/docker/*',
    'web/docker/*',
    'api/build/*',
    'web/build/*',
  ],
  testResultsProcessor: 'jest-sonar-reporter',
  collectCoverage: true,
};
