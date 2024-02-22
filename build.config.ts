import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
	entries: [{
		input: 'entry/main.js',
		name: 'main',
	}],
	outDir: '.build',
	declaration: true,
	rollup: {
		emitCJS: true,
		inlineDependencies: true
	},
	hooks: {
		'rollup:dts:options'(ctx, options) {
			// @ts-expect-error: Array at runtime
			options.plugins = options.plugins.filter((plugin) =>
				plugin.name !== 'commonjs'
			)
		}
	}
})