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
 * YAML Field Type Definition
 * Centralized schema for all field types supported by the YAML editor
 */
export interface YamlFieldType {
	/** Unique type identifier */
	type: string
	/** Display label */
	label: string
	/** Lucide icon name */
	icon: string
	/** Default value when creating new field of this type */
	defaultValue: any
	/** Optional slot name for custom component rendering */
	component?: string
	/** Optional detection function for auto-typing existing values */
	detect?: (value: any) => boolean
}
