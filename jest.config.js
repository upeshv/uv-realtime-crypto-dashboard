/**
 * Jest Configuration
 * * Extends the default WordPress testing suite. 
 * The moduleNameMapper forces Jest to resolve a single instance of React.
 * This prevents the "Invalid hook call" (null dispatcher) error when testing 
 * isolated custom hooks in JSDOM outside of the standard Gutenberg editor context.
 */
module.exports = {
  preset: '@wordpress/jest-preset-default',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^react$': '<rootDir>/node_modules/react',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
    '^@wordpress/element$': '<rootDir>/node_modules/react'
  }
};