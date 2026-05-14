/**
 * Extends WordPress default Babel presets.
 * Required for Jest to properly parse JSX and modern TypeScript syntax during tests.
 */
module.exports = {
    presets: ['@wordpress/babel-preset-default'],
};