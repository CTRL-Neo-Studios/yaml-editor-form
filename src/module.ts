import {defineNuxtModule, addPlugin, createResolver, addComponentsDir, addImportsDir} from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {
}

export default defineNuxtModule<ModuleOptions>({
	meta: {
		name: '@type32/yaml-editor-form',
		configKey: 'yamlEditorForm',
	},
	// Default configuration options of the Nuxt module
	defaults: {},
	setup(_options, _nuxt) {
		const resolver = createResolver(import.meta.url)

		// Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`

		addComponentsDir({path: resolver.resolve('runtime/components')})
		addImportsDir(resolver.resolve('runtime/composables'))

		_nuxt.options.build.transpile.push('yaml')

		_nuxt.options.alias['@type32/yaml-editor-form'] = resolver.resolve(
			'./runtime/types/types',
		)
	},
})
