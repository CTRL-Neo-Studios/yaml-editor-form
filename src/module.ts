import {defineNuxtModule, addPlugin, createResolver, addComponentsDir, addImportsDir, installModules, hasNuxtModule} from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {
}

export default defineNuxtModule<ModuleOptions>({
	meta: {
		name: '@type32/yaml-editor-form',
		configKey: 'yamlEditorForm',
	},
	moduleDependencies: {
		'@nuxt/ui': {
			version: '>=4.4.0'
		}
	},
	async setup(_options, _nuxt) {
		const resolver = createResolver(import.meta.url)

		// Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`

		addComponentsDir({path: resolver.resolve('runtime/components')})
		addImportsDir(resolver.resolve('runtime/composables'))

		_nuxt.options.build.transpile.push('js-yaml')

		_nuxt.options.alias['@type32/yaml-editor-form'] = resolver.resolve(
			'./runtime/types/types',
		)

		_nuxt.options.alias['@type32/yaml-editor-form/css'] = resolver.resolve(
			'./runtime/assets/css',
		)

		_nuxt.options.css.unshift(resolver.resolve('./runtime/assets/css/main.css'))

		_nuxt.options.css.push(resolver.resolve("./runtime/assets/css/main.css"));
	},
})
