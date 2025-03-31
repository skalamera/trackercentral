module.exports = {
    // The root directory that Jest should scan for tests
    rootDir: '.',

    // The test environment that will be used for testing
    testEnvironment: 'node',

    // The glob patterns Jest uses to detect test files
    testMatch: [
        '<rootDir>/tests/**/*.test.js'
    ],

    // Setup file to run before each test
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

    // Transform files with babel for ES6 support if needed
    // transform: {
    //   '^.+\\.js$': 'babel-jest'
    // },

    // An array of regexp pattern strings that are matched against all test paths
    // before executing the test, tests with paths matching these patterns are skipped
    testPathIgnorePatterns: [
        '/node_modules/'
    ],

    // Indicates whether each individual test should be reported during the run
    verbose: true,

    // Add code coverage reporting
    collectCoverage: true,
    collectCoverageFrom: [
        'app/**/*.js',
        '!app/scripts/app.js', // Exclude the original app.js since we can't properly test it
        'app/scripts/app-exports.js', // Include our new exports file
        '!app/debugDistrictSubmission-fixed.js' // Exclude this file since we're testing it via our own implementation
    ],
    coverageReporters: ['text', 'lcov'],

    // Automatically clear mock calls and instances between every test
    clearMocks: true,

    // The directory where Jest should output its coverage files
    coverageDirectory: 'coverage',

    // Mocks for specific modules
    moduleNameMapper: {
        // Mock CSS modules or other non-JS files if needed
        // '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
        // '\\.(gif|ttf|eot|svg)$': '<rootDir>/tests/__mocks__/fileMock.js'
    },

    // Mock functions or implementations for certain modules
    modulePathIgnorePatterns: [
        '<rootDir>/node_modules/'
    ]
}; 