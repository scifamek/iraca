import type { Config } from 'jest';

const config: Config = {
	preset: 'ts-jest',
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

	testEnvironment: 'node',
	moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
	testMatch: ['<rootDir>/tests/**/*.test.ts'],
	collectCoverage: true,
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
	},
	transform: {
		'^.+\\.ts?$': ['ts-jest', {tsconfig: './tsconfig.tests.json'}],
	},
};

export default config;
