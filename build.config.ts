import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
	entries: [{
		input: 'exports/main.js',
		name: 'main',
	}],
	outDir: '.build',
	declaration: true,
	rollup: {
		emitCJS: true,
		inlineDependencies: true,
	},
});
