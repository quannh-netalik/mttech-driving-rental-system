import { afterEach, vi } from 'vitest';

// Setup DOM-like environment for tests
const mockWindow = {
	location: { href: '' },
};
// Setup global mocks
vi.stubGlobal('window', mockWindow);
// Cleanup after tests

afterEach(() => {
	vi.unstubAllGlobals();
});
