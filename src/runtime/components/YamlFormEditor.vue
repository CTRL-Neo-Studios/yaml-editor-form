<script setup lang="ts">
import type {YamlFieldType, YamlFormData} from "../types/types";
import {useYamlFieldTypes} from "../composables/useYamlFieldTypes";
import {ref, watch, computed} from 'vue';

/**
 * YAML Form Data Editor
 *
 * Schema-driven form editor for YAML/frontmatter data.
 * Supports custom field types through the fieldTypes prop.
 *
 * Features:
 * - Primitive types (string, number, boolean, null)
 * - Complex types (date, datetime, string-array)
 * - Objects (nested structures)
 * - Arrays (primitives and objects)
 * - Recursive structures
 * - Custom field types with custom components
 *
 * Can be used standalone or embedded in the rich text editor for frontmatter editing.
 */


const data = defineModel<YamlFormData>({ required: true })

const props = withDefaults(defineProps<{
    filePath?: string,
    readonly?: boolean,
    /** Custom field type definitions (merged with defaults) */
    fieldTypes?: YamlFieldType[],
	size?: "xl" | "lg" | "md" | "sm" | "xs"
}>(), {
    readonly: false,
	size: 'xs'
})

// Initialize field types composable with custom types
const { getDefaultValue, getTypeMenuItems } = useYamlFieldTypes(props.fieldTypes)

// Track if data has unsaved changes
const isDirty = ref(false)

// Watch for changes
watch(data, () => {
    isDirty.value = true
}, { deep: true })

// Add new field to root using schema-based default value
function addField(fieldType: string = 'string') {
    if (!data.value) data.value = {}

    const newKey = `field_${Object.keys(data.value).length + 1}`
    // Create new object to trigger computed setter
    data.value = {
        ...data.value,
        [newKey]: getDefaultValue(fieldType)
    }
}

// Remove field from root
function removeField(key: string) {
    if (data.value) {
        // Create new object without the key to trigger computed setter
        const { [key]: removed, ...rest } = data.value
        data.value = rest
    }
}

// Schema-based dropdown options for adding fields
const addFieldOptions = computed(() => {
    return getTypeMenuItems((type) => addField(type))
})
</script>

<template>
	<ClientOnly>
		<div class="space-y-3">
			<YamlFormField
				v-for="(value, key) in data"
				:key="String(key)"
				:model-value="data[key]"
				:field-key="String(key)"
				:readonly="readonly"
				:field-types="fieldTypes"
				:size="size"
				@update:model-value="(newValue) => {
					// Create new object to trigger computed setter
					data = { ...data, [key]: newValue }
				}"
				@remove="removeField(String(key))"
				@update:field-key="(newKey: string) => {
                    if (newKey !== key && data) {
                        // Create new object with renamed key to trigger computed setter
                        const { [key]: value, ...rest } = data
                        data = {
                            ...rest,
                            [newKey]: value
                        }
                    }
                }"
			>
				<!-- Forward all slots to YamlFormField for custom field components -->
				<template v-for="(_, name) in $slots" #[name]="slotProps">
					<slot :name="name" v-bind="slotProps" />
				</template>
			</YamlFormField>

			<UDropdownMenu
				v-if="!readonly"
				:items="[addFieldOptions]"
				:size="size"
			>
				<UButton
					icon="i-lucide-plus"
					label="Add Field"
					variant="ghost"
					:size="size"
				/>
			</UDropdownMenu>
		</div>
	</ClientOnly>
</template>
