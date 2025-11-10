import { afterEach, beforeEach, vi } from 'vitest';

// Setup DOM-like environment for tests
const mockWindow = {
	location: { href: '' },
};

beforeEach(() => {
	vi.stubGlobal('window', mockWindow);
});

afterEach(() => {
	vi.unstubAllGlobals();
});
