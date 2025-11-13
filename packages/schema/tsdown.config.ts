import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: ['./src/*.ts'],
	format: ['cjs', 'esm'],
	platform: 'node',
	dts: true,
	onSuccess() {
		console.info('🙏 [@workspace/schema] Build succeeded!');
	},
});
