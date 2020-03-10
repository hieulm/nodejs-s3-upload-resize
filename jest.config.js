module.exports = {
  verbose: true,
  bail: true,
  testURL: 'http://localhost:3001',
  globals: {
    __DEV__: true,
  },
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['node_modules'],
};
