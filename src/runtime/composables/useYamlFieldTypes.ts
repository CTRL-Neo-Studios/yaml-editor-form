import type {YamlFieldType, YamlBaseType} from "../types/types";
import {computed} from 'vue';

// Helper detection functions
function isDateObject(value: any): boolean {
    return value instanceof Date
}

function isDateString(value: any): boolean {
    if (typeof value !== 'string') return false
    // Match YYYY-MM-DD format
    return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function isDateTimeString(value: any): boolean {
    if (typeof value !== 'string') return false
    // Match ISO 8601 datetime format
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)
}

function isStringArray(value: any): boolean {
    return Array.isArray(value) && value.length > 0 && value.every(item => typeof item === 'string')
}

/**
 * Composable for managing YAML field types
 */
export function useYamlFieldTypes(customTypes?: YamlFieldType[]) {
	const DEFAULT_FIELD_TYPES: YamlFieldType[] = [
		{
			type: 'string',
			label: 'Text',
			icon: 'i-lucide-type',
			defaultValue: '',
			baseType: 'string',
			detect: (value) => typeof value === 'string' && !isDateString(value) && !isDateTimeString(value)
		},
		{
			type: 'textarea',
			label: 'Long Text',
			icon: 'i-lucide-align-left',
			defaultValue: '',
			baseType: 'string',
			component: 'textarea'
		},
		{
			type: 'number',
			label: 'Number',
			icon: 'i-lucide-hash',
			defaultValue: 0,
			baseType: 'number',
			detect: (value) => typeof value === 'number'
		},
		{
			type: 'boolean',
			label: 'Boolean',
			icon: 'i-lucide-circle-check',
			defaultValue: false,
			baseType: 'boolean',
			detect: (value) => typeof value === 'boolean'
		},
		{
			type: 'date',
			label: 'Date',
			icon: 'i-lucide-calendar',
			defaultValue: () => new Date(),
			baseType: 'date',
			detect: (value) => isDateObject(value) || isDateString(value)
		},
		{
			type: 'datetime',
			label: 'Date & Time',
			icon: 'i-lucide-calendar-clock',
			defaultValue: () => new Date(),
			baseType: 'datetime',
			detect: (value) => isDateTimeString(value)
		},
		{
			type: 'string-array',
			label: 'Tags',
			icon: 'i-lucide-tags',
			defaultValue: [],
			baseType: 'string-array',
			detect: (value) => isStringArray(value)
		},
		{
			type: 'array',
			label: 'Array',
			icon: 'i-lucide-list',
			defaultValue: [],
			baseType: 'array',
			detect: (value) => Array.isArray(value) && !isStringArray(value)
		},
		{
			type: 'object',
			label: 'Object',
			icon: 'i-lucide-box',
			defaultValue: {},
			baseType: 'object',
			detect: (value) => typeof value === 'object' && value !== null && !Array.isArray(value) && !isDateObject(value)
		},
		{
			type: 'null',
			label: 'Null',
			icon: 'i-lucide-circle-slash',
			defaultValue: null,
			baseType: 'null',
			detect: (value) => value === null
		}
	]

    // Merge custom types with defaults
    const fieldTypes = computed(() => {
        const types = [...DEFAULT_FIELD_TYPES]
        const newCustomTypes: YamlFieldType[] = []

        if (customTypes) {
            // Separate custom types into overrides and new types
            for (const customType of customTypes) {
                const existingIndex = types.findIndex(t => t.type === customType.type)
                if (existingIndex >= 0) {
                    // Override existing type
                    types[existingIndex] = customType
                } else {
                    // New custom type - will be prepended (checked first)
                    newCustomTypes.push(customType)
                }
            }
        }

        // Prepend new custom types so they're checked BEFORE default types
        // This ensures:
        // 1. Custom types appear FIRST in "Add Field" dropdowns
        // 2. Custom detect functions are checked before default types
        return [...newCustomTypes, ...types]
    })

    /**
     * Get field type definition by type identifier
     */
    const getFieldType = (type: string): YamlFieldType | undefined => {
        return fieldTypes.value.find(t => t.type === type)
    }

    /**
     * Detect field type from a value
     */
    const detectFieldType = (value: any): YamlFieldType => {
        for (const fieldType of fieldTypes.value) {
            if (fieldType.detect && fieldType.detect(value)) {
                return fieldType
            }
        }
        // Default to string if no match
        return fieldTypes.value.find(t => t.type === 'string')!
    }

    /**
     * Get default value for a field type
     */
    const getDefaultValue = (type: string): any => {
        const fieldType = getFieldType(type)
        if (!fieldType) return ''

        // If defaultValue is a function, call it
        return typeof fieldType.defaultValue === 'function'
            ? fieldType.defaultValue()
            : fieldType.defaultValue
    }

    /**
     * Get icon for a field type
     */
    const getIcon = (type: string): string => {
        return getFieldType(type)?.icon || 'i-lucide-circle-question-mark'
    }

    /**
     * Get dropdown menu items for type selection
     */
    const getTypeMenuItems = (onSelect: (type: string) => void) => {
        return fieldTypes.value.map(fieldType => ({
            label: fieldType.label,
            icon: fieldType.icon,
            onSelect: () => onSelect(fieldType.type)
        }))
    }

    return {
        fieldTypes,
        getFieldType,
        detectFieldType,
        getDefaultValue,
        getIcon,
        getTypeMenuItems,
		DEFAULT_FIELD_TYPES
    }
}
