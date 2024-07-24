module.exports = {
  transform: {
    '\\.ts$': 'ts-jest',
    '^.+\\.tsx?$': [
      'ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' },
    ],
  },
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx', 'node'],
  moduleNameMapper: {
    '^uuid$': 'uuid',
    '@anotherbush/([a-zA-Z-_/]*)$': '<rootDir>/packages/$1/src',
  },
  transformIgnorePatterns: ['/node_modules/(?!bcp-47)/'],
  modulePathIgnorePatterns: ['/lib/'],
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: ['packages/*/src/**/*', '!**/index.ts', '!**/*.tsx'],
  coveragePathIgnorePatterns: ['/node_modules/'],
};
