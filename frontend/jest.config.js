module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts',
    '!src/setupTests.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30
    }
  },
  transformIgnorePatterns: [
    'node_modules/(?!(axios|lucide-react)/)'
  ],
  moduleNameMapping: {
    '^axios$': require.resolve('axios')
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js']
};