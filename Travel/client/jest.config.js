module.exports = {
  
    transform: {
      "^.+\\.(js|jsx)$": "babel-jest",
    },
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
      "\\.(jpg|jpeg|png|gif|webp|svg|avif)$": "<rootDir>/__mocks__/fileMock.js",
    },
    "transformIgnorePatterns": [
      "node_modules/(?!(axios)/)"
    ],
  };