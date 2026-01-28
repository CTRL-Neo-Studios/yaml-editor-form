export type YamlFormData<T extends object = {}> = {
	title?: string;
	description?: string;
	date?: Date;
	draft?: boolean;
	tags?: string[];
	categories?: string[];
	image?: string;
	slug?: string;
	[key: string]: any;
} & T

/**
 * Base types that define conversion rules
 * Custom types inherit conversion rules from these base types
 */
export type YamlBaseType = 
	| 'string'       // Text primitives
	| 'number'       // Numeric primitives
	| 'boolean'      // Boolean primitives
	| 'date'         // Date without time
	| 'datetime'     // Date with time
	| 'string-array' // Array of strings (tags)
	| 'array'        // Generic array
	| 'object'       // Generic object
	| 'null'         // Null value

/**
 * YAML Field Type Definition
 * Centralized schema for all field types supported by the YAML editor
 */
export interface YamlFieldType {
	/** Unique type identifier (can be custom, e.g. 'color', 'email', 'url') */
	type: string
	/** Display label shown in dropdowns */
	label: string
	/** Lucide icon name (e.g. 'i-lucide-palette') */
	icon: string
	/** Default value when creating new field of this type */
	defaultValue: any
	/** 
	 * Base type for conversion rules - determines what this type can convert to/from
	 * Custom types inherit conversion rules from their base type
	 * @example
	 * - color → 'string' (can convert to/from string, number, boolean, etc.)
	 * - percentage → 'number' (can convert to/from number, string, boolean)
	 */
	baseType: YamlBaseType
	/** Optional slot name for custom component rendering (e.g. 'color' → #field-color) */
	component?: string
	/** Optional detection function for auto-typing existing values */
	detect?: (value: any) => boolean
}
