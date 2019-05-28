const { pathsToModuleNameMapper } = require('ts-jest/utils')
const { compilerOptions } = require('./tsconfig')

module.exports = {
    // moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['<rootDir>/dist'],
    moduleDirectories: ['.', 'node_modules'],
}
