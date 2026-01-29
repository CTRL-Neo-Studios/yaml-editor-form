# YAML Form Editor

> A powerful, schema-driven YAML/frontmatter editor for Nuxt v4 with Nuxt UI components. Supports custom field types, nested structures, and extensible type system.

## Installation

```bash
bunx nuxi module add @type32/yaml-editor-form
```

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Component API](#component-api)
- [Field Types](#field-types)
- [Custom Field Types](#custom-field-types)
- [Schema System](#schema-system)
- [Usage Examples](#usage-examples)
- [File Structure](#file-structure)
- [Development](#development)
- [Type Definitions](#type-definitions)
- [Advanced Topics](#advanced-topics)

## Overview

The YAML Form Editor is a Nuxt Module that provides components for editing YAML data structures with a beautiful UI. It's built on top of Nuxt UI v4 and uses a schema-driven architecture for maximum extensibility.

### Key Characteristics

- **Schema-Driven**: All field types defined in a centralized registry
- **Recursive**: Handles deeply nested objects and arrays
- **Extensible**: Add custom field types with custom components via slots
- **Type-Safe**: Full TypeScript support
- **Auto-Detection**: Automatically detects field types from values
- **Conversion**: Convert between compatible types with data preservation
- **Validation-Ready**: Architecture supports easy validation integration

### Use Cases

- YAML/Frontmatter editing in Markdown editors
- Configuration file editors
- Form builders with dynamic schemas
- Admin panels with complex data structures
- API response editors
- Any structured data editing

## Features

### Built-in Field Types

| Type | Component | Description |
|------|-----------|-------------|
| `string` | `UInput` | Single-line text input |
| `textarea` | `UTextarea` | Multi-line text input (autoresizing) |
| `number` | `UInputNumber` | Numeric input with increment/decrement |
| `boolean` | `USwitch` | Toggle switch |
| `date` | `UInputDate` | Date picker (YYYY-MM-DD) |
| `datetime` | `UInputDate` | Date + time picker (ISO 8601) |
| `string-array` | `UInputTags` | Tag input for string arrays |
| `array` | Recursive | Array of any type (objects, primitives) |
| `object` | Recursive | Nested object with fields |
| `null` | Static | Displays "null" |

### Core Features

✅ **Auto Type Detection** - Automatically detects types from existing values  
✅ **Type Conversion** - Convert between compatible types (preserves data when possible)  
✅ **Field Renaming** - Rename object fields and array items inline  
✅ **Add/Remove Fields** - Dynamic field management with type selection  
✅ **Template Creation** - "Add from Template" for object arrays  
✅ **Nested Structures** - Unlimited nesting depth for objects and arrays  
✅ **Collapsible Sections** - Collapsible objects/arrays with item counts  
✅ **Read-only Mode** - Disable editing for view-only scenarios  
✅ **Custom Components** - Slot-based custom field rendering  
✅ **Schema Extension** - Add custom field types at runtime

## Quick Start

### Basic Usage

```vue
<script setup lang="ts">
const data = ref({
    title: 'My Article',
    published: false,
    publishedDate: '2024-01-28',
    tags: ['vue', 'nuxt', 'yaml'],
    author: {
        name: 'John Doe',
        email: 'john@example.com'
    }
})
</script>

<template>
    <YamlFormEditor v-model="data" />
</template>
```

### With Writable Computed

The editor fully supports writable computed refs for v-model:

```vue
<script setup lang="ts">
const rawData = ref({
    title: 'Article',
    published: false
})

// Writable computed with getter/setter
const data = computed({
    get: () => rawData.value,
    set: (value) => {
        console.log('Data updated:', value)
        rawData.value = value
        // You can add validation, transformations, API calls, etc.
    }
})
</script>

<template>
    <YamlFormEditor v-model="data" />
</template>
```

**Note:** The editor properly triggers computed setters by creating new object references instead of mutating in place, ensuring full compatibility with writable computed refs.

### With Custom Field Types

```vue
<script setup lang="ts">
import type { YamlFieldType } from '@type32/yaml-editor-form'

const customTypes: YamlFieldType[] = [
    {
        type: 'image',
        label: 'Image',
        icon: 'i-lucide-image',
        defaultValue: '',
        baseType: 'string',
        component: 'image'
    }
]

const data = ref({
    title: 'Article',
    banner: '/images/banner.jpg'
})
</script>

<template>
    <YamlFormEditor v-model="data" :field-types="customTypes">
        <template #field-image="{ modelValue, readonly, updateModelValue }">
            <MyImagePicker 
                :model-value="modelValue" 
                :disabled="readonly"
                @update:model-value="updateModelValue"
            />
        </template>
    </YamlFormEditor>
</template>
```

## Architecture

### Component Hierarchy

```
YamlFormEditor.vue (Entry Point)
└── YamlFormField.vue (Recursive Component)
    ├── YamlFieldInput.vue (Simple Types)
    │   ├── UInput (string)
    │   ├── UTextarea (textarea)
    │   ├── UInputNumber (number)
    │   ├── USwitch (boolean)
    │   ├── UInputDate (date, datetime)
    │   ├── UInputTags (string-array)
    │   └── Custom Slots (user-defined)
    └── YamlFormField.vue (Complex Types - Recursive)
        ├── YamlCollapsible (objects/arrays)
        └── Array/Object rendering
```

### Data Flow

```
User Input
    ↓
YamlFieldInput (v-model)
    ↓
YamlFormField (v-model)
    ↓
YamlFormEditor (v-model)
    ↓
Parent Component (data binding)
```

### Schema System

```
useYamlFieldTypes.ts (Composable)
    ↓
DEFAULT_FIELD_TYPES (Registry)
    ↓
Type Detection → Type Conversion → Default Values
    ↓
Components (Rendering)
```

## Component API

### YamlFormEditor

Main entry point for the editor.

#### Props

```typescript
{
    modelValue: YamlFormData          // Required: The data to edit
    filePath?: string                 // Optional: File path (for display)
    readonly?: boolean                // Optional: Read-only mode
    fieldTypes?: YamlFieldType[]      // Optional: Custom field types
}
```

#### Events

```typescript
{
    'update:modelValue': (value: YamlFormData) => void
}
```

#### Slots

All custom field component slots are supported:

```vue
<template #field-{component}="{ modelValue, readonly, valueType, updateModelValue }">
    <!-- Your custom component -->
    <!-- Use :model-value and @update:model-value, NOT v-model -->
</template>
```

**Slot Props:**
- `modelValue`: Current field value (read-only prop)
- `readonly`: Whether field is in read-only mode
- `valueType`: Type identifier string
- `updateModelValue`: Function to update value: `(newValue) => void`

**Important:** You cannot use `v-model` on slot props (they're read-only). Use `:model-value` and `@update:model-value` instead:

```vue
<!-- ❌ WRONG - v-model doesn't work on slot props -->
<template #field-color="{ modelValue, readonly }">
    <UColorPicker v-model="modelValue" :disabled="readonly" />
</template>

<!-- ✅ CORRECT - use updateModelValue function -->
<template #field-color="{ modelValue, readonly, updateModelValue }">
    <UColorPicker 
        :model-value="modelValue" 
        :disabled="readonly"
        @update:model-value="updateModelValue"
    />
</template>
```

### YamlFormField

Recursive component that handles individual fields.

#### Props

```typescript
{
    modelValue: YamlValue             // Required: Field value
    fieldKey: string                  // Required: Field name/key
    readonly?: boolean                // Optional: Read-only mode
    depth?: number                    // Optional: Nesting depth
    fieldTypes?: YamlFieldType[]      // Optional: Custom field types
}
```

#### Events

```typescript
{
    'update:modelValue': (value: YamlValue) => void
    'remove': () => void
    'update:fieldKey': (newKey: string) => void
}
```

#### Slots

Same as YamlFormEditor - all custom field slots are forwarded through the recursive hierarchy.

### YamlFieldInput

Renders input components for simple types.

#### Props

```typescript
{
    modelValue: YamlValue             // Required: Field value
    valueType: string                 // Required: Type identifier
    readonly?: boolean                // Optional: Read-only mode
    fieldType?: YamlFieldType         // Optional: Field type definition
}
```

#### Events

```typescript
{
    'update:modelValue': (value: YamlValue) => void
}
```

#### Slots

```vue
<template #field-{component}="{ modelValue, readonly, valueType, updateModelValue }">
    <!-- Custom input component -->
    <!-- Use updateModelValue function for two-way binding -->
</template>
```

**Slot Props:**
- `modelValue`: Current value (read-only)
- `readonly`: Whether field is read-only
- `valueType`: Type identifier
- `updateModelValue`: Update function `(val) => void`

## Field Types

### Type Definition

```typescript
// Valid base types (type-safe!)
type YamlBaseType = 
    | 'string'       // Text primitives
    | 'number'       // Numeric primitives
    | 'boolean'      // Boolean primitives
    | 'date'         // Date without time
    | 'datetime'     // Date with time
    | 'string-array' // Array of strings (tags)
    | 'array'        // Generic array
    | 'object'       // Generic object
    | 'null'         // Null value

interface YamlFieldType {
    type: string              // Unique type identifier (e.g., 'color', 'email')
    label: string             // Display name in dropdowns
    icon: string              // Lucide icon name (i-lucide-*)
    defaultValue: any         // Default value or factory function
    baseType: YamlBaseType    // REQUIRED: Base type for conversion rules
    component?: string        // Optional: slot name for custom rendering
    detect?: (value: any) => boolean  // Optional: auto-detection function
}
```

**The `baseType` Field (Type-Safe!):**

The `baseType` field is **required** and must be one of the predefined base types. This provides:
- ✅ **TypeScript autocomplete** - IntelliSense suggests valid base types
- ✅ **Compile-time safety** - Typos are caught immediately
- ✅ **Conversion inheritance** - Custom types inherit conversion rules from their base
- ✅ **Clear semantics** - Explicit relationship between custom and base types

**Examples:**
```typescript
// ✅ Valid - 'string' is a valid YamlBaseType
{ type: 'color', baseType: 'string' }

// ✅ Valid - 'number' is a valid YamlBaseType
{ type: 'percentage', baseType: 'number' }

// ❌ Invalid - TypeScript error (not a valid base type)
{ type: 'custom', baseType: 'invalid' }  // Type error!
```

**Conversion Inheritance:**
- A `color` type with `baseType: 'string'` can convert to/from anything a string can
- A `percentage` type with `baseType: 'number'` inherits number conversions
- Custom types can also convert directly to/from their base type

This enables powerful type hierarchies without duplicating conversion logic.

### Built-in Types

```typescript
const DEFAULT_FIELD_TYPES: YamlFieldType[] = [
    {
        type: 'string',
        label: 'Text',
        icon: 'i-lucide-type',
        defaultValue: '',
        detect: (value) => typeof value === 'string' && !isDateString(value)
    },
    {
        type: 'textarea',
        label: 'Long Text',
        icon: 'i-lucide-align-left',
        defaultValue: '',
        component: 'textarea'
    },
    {
        type: 'number',
        label: 'Number',
        icon: 'i-lucide-hash',
        defaultValue: 0,
        detect: (value) => typeof value === 'number'
    },
    {
        type: 'boolean',
        label: 'Boolean',
        icon: 'i-lucide-circle-check',
        defaultValue: false,
        detect: (value) => typeof value === 'boolean'
    },
    {
        type: 'date',
        label: 'Date',
        icon: 'i-lucide-calendar',
        defaultValue: () => new Date(),
        detect: (value) => isDateObject(value) || isDateString(value)
    },
    {
        type: 'datetime',
        label: 'Date & Time',
        icon: 'i-lucide-calendar-clock',
        defaultValue: () => new Date(),
        detect: (value) => isDateTimeString(value)
    },
    {
        type: 'string-array',
        label: 'Tags',
        icon: 'i-lucide-tags',
        defaultValue: [],
        detect: (value) => isStringArray(value)
    },
    {
        type: 'array',
        label: 'Array',
        icon: 'i-lucide-list',
        defaultValue: [],
        detect: (value) => Array.isArray(value) && !isStringArray(value)
    },
    {
        type: 'object',
        label: 'Object',
        icon: 'i-lucide-box',
        defaultValue: {},
        detect: (value) => typeof value === 'object' && value !== null && !Array.isArray(value)
    },
    {
        type: 'null',
        label: 'Null',
        icon: 'i-lucide-circle-slash',
        defaultValue: null,
        detect: (value) => value === null
    }
]
```

### Type Conversion Rules

Valid conversions between types:

```typescript
const conversionRules = {
    'string': ['number', 'boolean', 'date', 'datetime', 'string-array', 'null'],
    'number': ['string', 'boolean', 'null'],
    'boolean': ['string', 'number', 'null'],
    'date': ['string', 'datetime', 'null'],
    'datetime': ['string', 'date', 'null'],
    'string-array': ['array', 'string', 'null'],
    'array': ['string-array', 'null'],
    'object': ['null']
}
```

**Special Behaviors:**
- Date ↔ DateTime: Preserves date value, adds/removes time component
- Array → Non-Array: Uses first item if available
- String-Array ↔ Array: Converts item types appropriately

## Custom Field Types

### Adding a Built-in Type

Edit the type registry composable:

```typescript
export const DEFAULT_FIELD_TYPES: YamlFieldType[] = [
    // ... existing types ...
    {
        type: 'email',
        label: 'Email',
        icon: 'i-lucide-mail',
        defaultValue: '',
        baseType: 'string',
        detect: (value) => typeof value === 'string' && /^[^@]+@[^@]+/.test(value)
    }
]
```

That's it! The type now:
- ✅ Appears in all "Add Field" dropdowns
- ✅ Auto-detects from existing values
- ✅ Has correct icon everywhere
- ✅ Uses correct default value

### Adding a Runtime Type (No Component)

```typescript
const customTypes: YamlFieldType[] = [
    {
        type: 'url',
        label: 'URL',
        icon: 'i-lucide-link',
        defaultValue: 'https://',
        baseType: 'string',
        detect: (value) => typeof value === 'string' && value.startsWith('http')
    }
]
```

```vue
<YamlFormEditor v-model="data" :field-types="customTypes" />
```

### Adding a Runtime Type (With Custom Component)

```typescript
const customTypes: YamlFieldType[] = [
    {
        type: 'color',
        label: 'Color',
        icon: 'i-lucide-palette',
        defaultValue: '#000000',
        baseType: 'string',  // Inherits string conversions
        component: 'color',  // Enables slot
        detect: (value) => typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value)
    }
]
```

```vue
<YamlFormEditor v-model="data" :field-types="customTypes">
    <template #field-color="{ modelValue, readonly, updateModelValue }">
        <input 
            type="color" 
            :value="modelValue"
            :disabled="readonly"
            @input="(e) => updateModelValue(e.target.value)"
            class="w-full h-10 rounded"
        />
    </template>
</YamlFormEditor>
```

### Overriding Built-in Types

```typescript
const customTypes: YamlFieldType[] = [
    {
        type: 'string',  // Same as built-in
        label: 'Rich Text',
        icon: 'i-lucide-file-text',
        defaultValue: '',
        baseType: 'string',
        component: 'richtext'  // Now uses custom component
    }
]
```

```vue
<YamlFormEditor v-model="data" :field-types="customTypes">
    <template #field-richtext="{ modelValue, readonly, updateModelValue }">
        <MyRichTextEditor 
            :model-value="modelValue" 
            :read-only="readonly"
            @update:model-value="updateModelValue"
        />
    </template>
</YamlFormEditor>
```

## Schema System

### Composable: useYamlFieldTypes

```typescript
import { useYamlFieldTypes } from './useYamlFieldTypes'

const { 
    fieldTypes,        // Computed array of all types
    getFieldType,      // Get type definition by ID
    detectFieldType,   // Auto-detect type from value
    getDefaultValue,   // Get default value for type
    getIcon,           // Get icon for type
    getTypeMenuItems   // Get dropdown menu items
} = useYamlFieldTypes(customTypes)
```

### Functions

#### getFieldType(type: string)

```typescript
const stringType = getFieldType('string')
// Returns: { type: 'string', label: 'Text', icon: 'i-lucide-type', ... }
```

#### detectFieldType(value: any)

```typescript
const type = detectFieldType('hello@example.com')
// Returns: { type: 'email', ... } if email type is defined
// Falls back to: { type: 'string', ... }
```

#### getDefaultValue(type: string)

```typescript
const defaultDate = getDefaultValue('date')
// Returns: new Date() (function is called)

const defaultString = getDefaultValue('string')
// Returns: ''
```

#### getIcon(type: string)

```typescript
const icon = getIcon('number')
// Returns: 'i-lucide-hash'
```

#### getTypeMenuItems(onSelect: (type: string) => void)

```typescript
const menuItems = getTypeMenuItems((type) => {
    console.log('Selected:', type)
})
// Returns: [
//   { label: 'Text', icon: 'i-lucide-type', onSelect: () => ... },
//   { label: 'Number', icon: 'i-lucide-hash', onSelect: () => ... },
//   ...
// ]
```

## Usage Examples

### Basic Form

```vue
<script setup lang="ts">
const config = ref({
    siteName: 'My Site',
    port: 3000,
    debug: false
})
</script>

<template>
    <YamlFormEditor v-model="config" />
</template>
```

### Nested Objects

```vue
<script setup lang="ts">
const article = ref({
    title: 'Article Title',
    meta: {
        author: 'John Doe',
        publishedAt: '2024-01-28',
        tags: ['vue', 'nuxt']
    }
})
</script>

<template>
    <YamlFormEditor v-model="article" />
</template>
```

### Arrays of Objects

```vue
<script setup lang="ts">
const data = ref({
    users: [
        { name: 'Alice', role: 'admin' },
        { name: 'Bob', role: 'user' }
    ]
})
</script>

<template>
    <YamlFormEditor v-model="data" />
</template>
```

### With Custom Types

```vue
<script setup lang="ts">
import type { YamlFieldType } from '@type32/yaml-editor-form'

// Define custom types
const customTypes: YamlFieldType[] = [
    {
        type: 'image',
        label: 'Image',
        icon: 'i-lucide-image',
        defaultValue: '',
        baseType: 'string',
        component: 'image'
    },
    {
        type: 'markdown',
        label: 'Markdown',
        icon: 'i-lucide-file-text',
        defaultValue: '',
        baseType: 'string',
        component: 'markdown'
    }
]

const post = ref({
    title: 'My Post',
    banner: '/images/banner.jpg',
    content: '# Hello World'
})
</script>

<template>
    <YamlFormEditor v-model="post" :field-types="customTypes">
        <!-- Image picker component -->
        <template #field-image="{ modelValue, readonly, updateModelValue }">
            <MyImagePicker 
                :model-value="modelValue" 
                :disabled="readonly"
                @update:model-value="updateModelValue"
            />
        </template>
        
        <!-- Markdown editor component -->
        <template #field-markdown="{ modelValue, readonly, updateModelValue }">
            <MyMarkdownEditor 
                :model-value="modelValue"
                :read-only="readonly"
                @update:model-value="updateModelValue"
            />
        </template>
    </YamlFormEditor>
</template>
```

### Dynamic Default Values

```vue
<script setup lang="ts">
const customTypes: YamlFieldType[] = [
    {
        type: 'uuid',
        label: 'UUID',
        icon: 'i-lucide-fingerprint',
        defaultValue: () => crypto.randomUUID(),  // Function called each time
        baseType: 'string',
        detect: (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(v)
    },
    {
        type: 'timestamp',
        label: 'Timestamp',
        icon: 'i-lucide-clock',
        defaultValue: () => new Date().toISOString(),
        baseType: 'string'
    }
]
</script>

<template>
    <YamlFormEditor v-model="data" :field-types="customTypes" />
</template>
```

### Read-only Mode

```vue
<template>
    <YamlFormEditor v-model="data" readonly />
</template>
```

### Complex Nested Structure

```vue
<script setup lang="ts">
const complexData = ref({
    project: {
        name: 'My Project',
        version: '1.0.0',
        dependencies: ['vue', 'nuxt'],
        config: {
            build: {
                outDir: 'dist',
                minify: true
            },
            server: {
                port: 3000,
                https: false
            }
        },
        contributors: [
            { name: 'Alice', email: 'alice@example.com' },
            { name: 'Bob', email: 'bob@example.com' }
        ]
    }
})
</script>

<template>
    <YamlFormEditor v-model="complexData" />
</template>
```

## File Structure

```
components/
├── YamlFormEditor.vue                     ← Entry component
├── YamlFormField.vue                      ← Recursive field component
├── YamlFieldInput.vue                     ← Input rendering component
└── YamlCollapsible.vue                    ← Collapsible UI component

composables/
└── useYamlFieldTypes.ts                   ← Type registry & composable

docs/
├── README.md                              ← This file (llms.txt + docs)
├── CUSTOM_FIELD_TYPES_GUIDE.md           ← Custom types guide
├── SCHEMA_REFACTOR_SUMMARY.md            ← Schema architecture docs
└── REFACTORING_SUMMARY.md                ← Component refactoring docs

types/
└── index.d.ts                             ← Type definitions
```

## Development

### Adding a New Built-in Type

1. **Edit the registry** in the type registry composable:

```typescript
{
    type: 'my-type',
    label: 'My Type',
    icon: 'i-lucide-my-icon',
    defaultValue: 'default',
    baseType: 'string',  // Required: specify base type for conversions
    detect: (value) => /* detection logic */
}
```

2. **Add rendering** (if needed) in the input component:

```vue
<MyCustomInput
    v-else-if="valueType === 'my-type'"
    v-model="modelValue"
    :disabled="readonly"
/>
```

3. **Done!** The type is now available everywhere.

### Adding a Custom Input Component

If you want a custom built-in component (not via slots):

1. **Add to YamlFieldInput.vue**:

```vue
<template>
    <!-- ... existing inputs ... -->
    
    <MyCustomComponent
        v-else-if="valueType === 'custom'"
        v-model="modelValue"
        :disabled="readonly"
    />
</template>
```

2. **Register the type** with the matching `type` value.

### Testing

Recommended test scenarios:

**Type Detection:**
- [ ] Auto-detects string, number, boolean
- [ ] Auto-detects date strings (YYYY-MM-DD)
- [ ] Auto-detects datetime strings (ISO 8601)
- [ ] Auto-detects string arrays
- [ ] Auto-detects object arrays

**Type Conversion:**
- [ ] String ↔ Number
- [ ] Date ↔ DateTime (preserves date)
- [ ] Array ↔ String-Array
- [ ] Array to non-array (uses first item)

**Field Operations:**
- [ ] Add field with type selection
- [ ] Remove field
- [ ] Rename field (simple types)
- [ ] Rename field (complex types via pencil icon)
- [ ] Add array item with type selection
- [ ] Remove array item
- [ ] Add item from template (object arrays)

**Nested Structures:**
- [ ] Objects in objects (deep nesting)
- [ ] Arrays in objects
- [ ] Objects in arrays
- [ ] Arrays in arrays

**Custom Types:**
- [ ] Custom type appears in dropdowns
- [ ] Custom type uses correct icon
- [ ] Custom type uses correct default value
- [ ] Custom component renders via slot
- [ ] Slot props are correct

**Edge Cases:**
- [ ] Empty objects display correctly
- [ ] Empty arrays display correctly
- [ ] Null values display correctly
- [ ] Read-only mode disables editing
- [ ] Array items can't be renamed (correct)
- [ ] Fields inside array items CAN be renamed

## Type Definitions

### Core Types

```typescript
// YAML value type (recursive)
type YamlValue = 
    | string 
    | number 
    | boolean 
    | null 
    | Date 
    | YamlValue[] 
    | { [key: string]: YamlValue }

// Form data type
type YamlFormData = { [key: string]: YamlValue }

// Field type definition
interface YamlFieldType {
    type: string
    label: string
    icon: string
    defaultValue: any | (() => any)
    component?: string
    detect?: (value: any) => boolean
}

// Dropdown menu item
interface DropdownMenuItem {
    label: string
    icon?: string
    onSelect?: () => void
    disabled?: boolean
}
```

### Component Props

```typescript
// YamlForm props
interface YamlFormProps {
    modelValue: YamlFormData
    filePath?: string
    readonly?: boolean
    fieldTypes?: YamlFieldType[]
}

// YamlFormField props
interface YamlFormFieldProps {
    modelValue: YamlValue
    fieldKey: string
    readonly?: boolean
    depth?: number
    fieldTypes?: YamlFieldType[]
}

// YamlFieldInput props
interface YamlFieldInputProps {
    modelValue: YamlValue
    valueType: string
    readonly?: boolean
    fieldType?: YamlFieldType
}
```

## Advanced Topics

### Slot Forwarding

Slots are automatically forwarded through the component hierarchy using Vue 3's dynamic slot forwarding:

```
YamlFormEditor (receives slot from parent)
    ↓ forwards all slots with v-bind="slotProps"
YamlFormField (receives & forwards slots)
    ↓ forwards all slots with v-bind="slotProps"
    ↓ (recursively for nested structures)
YamlFieldInput (terminal - uses slot)
    ↓ renders slot: #field-{component}
    ↓ provides props: { modelValue, readonly, valueType, updateModelValue }
Custom Component
```

**How It Works:**

1. **YamlFormEditor** (lines 89-92): Receives slots and forwards to YamlFormField
2. **YamlFormField** (lines 634-636): Forwards slots to YamlFieldInput OR itself (for recursion)
3. **YamlFieldInput** (lines 88-95): Final destination - renders slot with props

**Slot Props Flow:**

The `updateModelValue` function is created at the YamlFieldInput level and allows your custom component to update the value:

```typescript
// In YamlFieldInput.vue
:update-model-value="(val: YamlValue) => modelValue = val"
```

This function captures the parent's `modelValue` ref and updates it directly, maintaining reactivity throughout the hierarchy.

**Example with Nested Structure:**

```vue
<!-- Works at any depth! -->
<YamlFormEditor v-model="data" :field-types="customTypes">
    <template #field-color="{ modelValue, updateModelValue }">
        <UColorPicker 
            :model-value="modelValue"
            @update:model-value="updateModelValue"
        />
    </template>
</YamlFormEditor>
```

Even if your color field is deeply nested (`data.theme.colors.primary`), the slot works identically because slots are forwarded at every level.

### Type Priority & Detection Order

**Detection Order:**

Custom types with `detect` functions are **always** checked **before** default types:

1. **Custom types** (checked first) - Your custom types take priority
2. **Default types** (checked second) - Built-in types as fallback
3. **First matching type wins** - Detection stops at first match

This ensures:
- ✅ Your `color` type will be detected before the default `string` type
- ✅ Custom types override default detection behavior
- ✅ Custom types appear first in "Add Field" dropdowns

**Example:**
```typescript
// Custom color type checked FIRST
const customTypes = [{
    type: 'color',
    baseType: 'string',
    detect: (v) => typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v)
}]

// Value '#FF0000' will match 'color' before 'string'
```

**Important: Make Your Detect Functions Specific!**

Since detection stops at the first match, make sure your `detect` functions are specific enough:

```typescript
// ❌ TOO BROAD - will match ALL strings
{
    type: 'email',
    baseType: 'string',
    detect: (v) => typeof v === 'string'  // Too general!
}

// ✅ SPECIFIC - only matches email-like strings
{
    type: 'email',
    baseType: 'string',
    detect: (v) => typeof v === 'string' && /^[^@]+@[^@]+\.[^@]+$/.test(v)
}

// ✅ SPECIFIC - only matches hex colors
{
    type: 'color',
    baseType: 'string',
    detect: (v) => typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v)
}

// ✅ SPECIFIC - only matches URLs
{
    type: 'url',
    baseType: 'string',
    detect: (v) => typeof v === 'string' && /^https?:\/\//.test(v)
}
```

**Troubleshooting Detection Issues:**

If your custom type isn't being detected:
1. Check that `detect` function is specific enough
2. Ensure `detect` returns `true` for your value
3. Remember: first matching type wins (order matters!)
4. Test your detect function in isolation

**Base Type Conversions:**

When using `baseType`, conversion rules follow this logic:

1. Can convert between type and its baseType (e.g., `color` ↔ `string`)
2. Can convert to anything the baseType can (e.g., `color` → `number` because `string` → `number`)
3. Custom conversion rules take precedence over inherited rules

**Example order for default types:**
```typescript
[
    { type: 'datetime', detect: (v) => isDateTimeString(v) },  // Specific
    { type: 'date', detect: (v) => isDateString(v) },         // Less specific
    { type: 'string', detect: (v) => typeof v === 'string' }  // General
]
```

### Writable Computed Support

**✅ Fully Compatible** - The editor now fully supports writable computed refs through `defineModel` and nested components.

All internal operations use **immutable updates** to ensure computed setters are properly triggered:

```typescript
// ✅ All operations create new references (triggers computed setter)
data.value = { ...data.value, newField: 'value' }           // Add field
data.value = { ...data.value, [key]: newValue }             // Update field
const { [key]: removed, ...rest } = data.value              // Remove field
data.value = rest

// ✅ Array operations also use immutable patterns
array.value = [...array.value, newItem]                     // Add item
array.value = array.value.filter((_, i) => i !== index)    // Remove item
const newArr = [...array.value]; newArr[i] = val            // Update item
array.value = newArr
```

**✅ Works Through Multiple Component Layers:**

The editor correctly handles writable computed passed through `defineModel` in nested components:

```vue
<!-- Parent Component -->
<script setup lang="ts">
const rawData = ref({ title: 'Article' })

// Writable computed with validation
const data = computed({
    get: () => rawData.value,
    set: (value) => {
        console.log('Data updated:', value)
        // Add validation, transformations, etc.
        rawData.value = value
    }
})
</script>

<template>
    <!-- Works! Passes through DataEditorForm → YamlFormEditor -->
    <DataEditorForm v-model="data" />
</template>
```

**Use Cases for Writable Computed:**
- ✅ Validation before saving
- ✅ Transform data on save (e.g., serialize dates)
- ✅ Sync with external state management (Pinia, Vuex)
- ✅ Trigger side effects on changes (API calls, logging)
- ✅ Implement undo/redo functionality
- ✅ Complex editor integrations (TipTap, Monaco, etc.)

**Example with Pinia:**
```typescript
const store = useMyStore()

const data = computed({
    get: () => store.formData,
    set: (value) => store.updateFormData(value)
})
```

**Example with TipTap Editor Integration:**
```typescript
const editorInstance = defineModel('editorInstance', { required: true })
const $ef = useEditorFrontmatter(editorInstance)

const data = computed({
    get: () => $ef.getFrontmatter().data || {},
    set: (newValue) => {
        // Updates editor content directly
        $ef.setFrontmatterProperties({ ...newValue })
    }
})
```

### Performance Considerations

**Reactivity:**
- Uses Vue 3 `ref` and `computed` for optimal reactivity
- Deep watching is used only where necessary
- Recursive rendering is optimized with `v-if` conditionals
- **Immutable updates** ensure computed setters are triggered properly

**Large Arrays:**
- Each array item is independently reactive
- Adding/removing items doesn't re-render siblings
- Collapsible sections prevent rendering hidden content

**Memory:**
- Date helper functions are minimal
- No global state except type registry
- Components clean up properly on unmount
- Immutable updates create minimal object copies (spread operator is fast)

### Validation (Future)

The architecture supports easy validation integration:

```typescript
interface YamlFieldType {
    // ... existing fields ...
    validate?: (value: any) => boolean | string
    format?: (value: any) => string
    parse?: (input: string) => any
}
```

### Accessibility

**Keyboard Navigation:**
- Tab through fields
- Enter to confirm edits
- Escape to cancel edits
- Arrow keys in number inputs

**Screen Readers:**
- Proper ARIA labels on inputs
- Semantic HTML structure
- Form field associations

**Focus Management:**
- Auto-focus on edit mode
- Focus returns to trigger after close
- Visible focus indicators

### Migration from Other Editors

**From JSON Editor:**
```typescript
const jsonData = JSON.parse(jsonString)
const yamlData = ref(jsonData)
```

**To YAML:**
```typescript
import yaml from 'js-yaml'
const yamlString = yaml.dump(yamlData.value)
```

**From Object:**
```typescript
const yamlData = ref({ ...existingObject })
```

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires:
- Vue 3.3+
- Nuxt 3.0+
- Modern JavaScript (ES2020+)

### Dependencies

**Required:**
- Vue 3
- Nuxt UI v4
- @internationalized/date (for date/time inputs)
- Lucide Icons (for icons)

**Peer Dependencies:**
- reka-ui (via Nuxt UI)
- tailwindcss (via Nuxt)

## Advanced Examples

### Custom String Array Type

Here's an example of a custom string array type with autocomplete suggestions:

```vue
<script setup lang="ts">
import type { YamlFieldType } from '@type32/yaml-editor-form'

const customTypes: YamlFieldType[] = [
    {
        type: 'skills',
        label: 'Skills',
        icon: 'i-lucide-sparkles',
        defaultValue: [],
        baseType: 'string-array',  // Inherits array conversions
        component: 'skills',
        detect: (value) => {
            // Auto-detect arrays with skill-like strings
            return Array.isArray(value) && 
                   value.length > 0 && 
                   value.every(v => typeof v === 'string' && v.length < 30)
        }
    }
]

const profile = ref({
    name: 'John Doe',
    skills: ['Vue.js', 'TypeScript', 'Nuxt']
})

// Predefined skill suggestions
const skillSuggestions = [
    'Vue.js', 'React', 'Angular', 'TypeScript', 'JavaScript',
    'Node.js', 'Python', 'Nuxt', 'Next.js', 'Tailwind CSS'
]
</script>

<template>
    <YamlFormEditor v-model="profile" :field-types="customTypes">
        <!-- Custom skills input with autocomplete -->
        <template #field-skills="{ modelValue, readonly, updateModelValue }">
            <div class="space-y-2">
                <!-- Display current skills as badges -->
                <div class="flex flex-wrap gap-2">
                    <UBadge
                        v-for="(skill, index) in (modelValue as string[])"
                        :key="index"
                        color="primary"
                        variant="soft"
                    >
                        {{ skill }}
                        <UButton
                            v-if="!readonly"
                            icon="i-lucide-x"
                            size="2xs"
                            variant="ghost"
                            :padded="false"
                            @click="updateModelValue((modelValue as string[]).filter((_, i) => i !== index))"
                        />
                    </UBadge>
                </div>
                
                <!-- Add new skill with autocomplete -->
                <UInputMenu
                    v-if="!readonly"
                    :options="skillSuggestions"
                    placeholder="Add skill..."
                    @update:model-value="(newSkill: string) => {
                        if (newSkill && !(modelValue as string[]).includes(newSkill)) {
                            updateModelValue([...(modelValue as string[]), newSkill])
                        }
                    }"
                />
            </div>
        </template>
    </YamlFormEditor>
</template>
```

### Custom Object Array Type

Here's an example of a custom object array type with card-based rendering:

```vue
<script setup lang="ts">
import type { YamlFieldType } from '@type32/yaml-editor-form'

const customTypes: YamlFieldType[] = [
    {
        type: 'contacts',
        label: 'Contacts',
        icon: 'i-lucide-users',
        defaultValue: [],
        baseType: 'array',  // Inherits array conversions
        component: 'contacts',
        detect: (value) => {
            // Auto-detect arrays of contact-like objects
            return Array.isArray(value) && 
                   value.length > 0 &&
                   value.every(v => 
                       v && typeof v === 'object' && 
                       ('name' in v || 'email' in v)
                   )
        }
    }
]

const data = ref({
    projectName: 'My Project',
    contacts: [
        { name: 'Alice Johnson', email: 'alice@example.com', role: 'Designer' },
        { name: 'Bob Smith', email: 'bob@example.com', role: 'Developer' }
    ]
})
</script>

<template>
    <YamlFormEditor v-model="data" :field-types="customTypes">
        <!-- Custom contacts list with card UI -->
        <template #field-contacts="{ modelValue, readonly, updateModelValue }">
            <div class="space-y-3">
                <!-- Contact cards -->
                <UCard
                    v-for="(contact, index) in (modelValue as any[])"
                    :key="index"
                    :ui="{ body: { padding: 'p-4' } }"
                >
                    <div class="flex items-start justify-between gap-3">
                        <div class="flex-1 space-y-2">
                            <!-- Name -->
                            <UInput
                                :model-value="contact.name"
                                placeholder="Name"
                                :disabled="readonly"
                                @update:model-value="(val: string) => {
                                    const updated = [...(modelValue as any[])]
                                    updated[index] = { ...contact, name: val }
                                    updateModelValue(updated)
                                }"
                            />
                            
                            <!-- Email -->
                            <UInput
                                :model-value="contact.email"
                                type="email"
                                placeholder="Email"
                                icon="i-lucide-mail"
                                :disabled="readonly"
                                @update:model-value="(val: string) => {
                                    const updated = [...(modelValue as any[])]
                                    updated[index] = { ...contact, email: val }
                                    updateModelValue(updated)
                                }"
                            />
                            
                            <!-- Role -->
                            <UInput
                                :model-value="contact.role"
                                placeholder="Role"
                                icon="i-lucide-briefcase"
                                :disabled="readonly"
                                @update:model-value="(val: string) => {
                                    const updated = [...(modelValue as any[])]
                                    updated[index] = { ...contact, role: val }
                                    updateModelValue(updated)
                                }"
                            />
                        </div>
                        
                        <!-- Remove button -->
                        <UButton
                            v-if="!readonly"
                            icon="i-lucide-trash-2"
                            color="red"
                            variant="ghost"
                            size="sm"
                            @click="updateModelValue((modelValue as any[]).filter((_, i) => i !== index))"
                        />
                    </div>
                </UCard>
                
                <!-- Add contact button -->
                <UButton
                    v-if="!readonly"
                    icon="i-lucide-plus"
                    label="Add Contact"
                    variant="outline"
                    block
                    @click="updateModelValue([
                        ...(modelValue as any[]),
                        { name: '', email: '', role: '' }
                    ])"
                />
            </div>
        </template>
    </YamlFormEditor>
</template>
```

### Combined Example

You can use both custom array types together:

```vue
<script setup lang="ts">
import type { YamlFieldType } from '@type32/yaml-editor-form'

const customTypes: YamlFieldType[] = [
    // Custom string array
    {
        type: 'tags',
        label: 'Tags',
        icon: 'i-lucide-tag',
        defaultValue: [],
        baseType: 'string-array',
        component: 'tags',
        detect: (v) => Array.isArray(v) && v.every(i => typeof i === 'string')
    },
    // Custom object array
    {
        type: 'team',
        label: 'Team Members',
        icon: 'i-lucide-users',
        defaultValue: [],
        baseType: 'array',
        component: 'team',
        detect: (v) => Array.isArray(v) && v.every(i => i?.name || i?.email)
    }
]

const project = ref({
    name: 'Website Redesign',
    tags: ['frontend', 'design', 'urgent'],
    team: [
        { name: 'Alice', email: 'alice@example.com' },
        { name: 'Bob', email: 'bob@example.com' }
    ]
})
</script>

<template>
    <YamlFormEditor v-model="project" :field-types="customTypes">
        <!-- String array implementation -->
        <template #field-tags="{ modelValue, readonly, updateModelValue }">
            <UInputTags
                :model-value="modelValue as string[]"
                :disabled="readonly"
                placeholder="Add tags..."
                @update:model-value="updateModelValue"
            />
        </template>
        
        <!-- Object array implementation -->
        <template #field-team="{ modelValue, readonly, updateModelValue }">
            <!-- Your custom team member UI here -->
            <div class="space-y-2">
                <div
                    v-for="(member, idx) in (modelValue as any[])"
                    :key="idx"
                    class="flex gap-2"
                >
                    <UInput
                        :model-value="member.name"
                        placeholder="Name"
                        :disabled="readonly"
                        @update:model-value="(val: string) => {
                            const updated = [...(modelValue as any[])]
                            updated[idx] = { ...member, name: val }
                            updateModelValue(updated)
                        }"
                    />
                    <UButton
                        v-if="!readonly"
                        icon="i-lucide-x"
                        color="red"
                        variant="ghost"
                        @click="updateModelValue((modelValue as any[]).filter((_, i) => i !== idx))"
                    />
                </div>
                <UButton
                    v-if="!readonly"
                    icon="i-lucide-plus"
                    label="Add Member"
                    size="sm"
                    @click="updateModelValue([...(modelValue as any[]), { name: '', email: '' }])"
                />
            </div>
        </template>
    </YamlFormEditor>
</template>
```

### Key Patterns for Array Types

**String Arrays (`baseType: 'string-array'`):**
- Use for specialized tag inputs, category lists, etc.
- Can convert to/from regular arrays and strings
- Good for: skills, tags, categories, keywords

**Object Arrays (`baseType: 'array'`):**
- Use for collections with structured data
- Provide custom UI for adding/editing/removing items
- Good for: contacts, team members, products, events

**Important Notes:**
1. **Type Assertions**: Use `(modelValue as string[])` or `(modelValue as any[])` for type safety
2. **Immutability**: Always create new arrays when updating (spread operator `[...]`)
3. **Index Management**: Track items by index for updates/deletions
4. **Add Operations**: Spread existing array and add new items
5. **Remove Operations**: Use `filter()` to remove by index
6. **Update Operations**: Clone array, modify specific index, update entire array

## License

This component is part of the Vertex project.

## Contributing

When adding features:

1. **Update the registry** if adding types
2. **Update this README** for API changes
3. **Add tests** for new functionality
4. **Update TypeScript types** for new props/events
5. **Check linter** (must pass with 0 errors)
6. **Verify backward compatibility**

## Support

For issues, questions, or feature requests, refer to the main Vertex project documentation.

## Quick Reference (LLM Context)

### Core Components

- **YamlFormEditor**: Entry point component for the editor
- **YamlFormField**: Recursive component handling individual fields
- **YamlFieldInput**: Input rendering component for simple types
- **YamlCollapsible**: UI component for collapsible sections
- **useYamlFieldTypes**: Composable for type registry and management

### Key Concepts

1. **Schema-Driven**: All types defined in centralized registry
2. **Recursive**: YamlFormField calls itself for nested structures
3. **Slot-Based**: Custom components via Vue 3 slots
4. **Type-Safe**: Full TypeScript support throughout
5. **Extensible**: Add types without modifying core code

### Architecture Patterns

- **Composition API**: All components use `<script setup>`
- **v-model**: Two-way binding for data
- **Emit Events**: For field operations (remove, rename)
- **Slot Forwarding**: Custom components at any nesting level
- **Computed Properties**: Reactive type detection and menus

### Common Operations

**Add Type:**
```typescript
// Edit the type registry composable → DEFAULT_FIELD_TYPES array
```

**Add Custom Component:**
```vue
<YamlFormEditor v-model="data" :field-types="customTypes">
  <template #field-{type}="{ modelValue, readonly, updateModelValue }">
    <MyComponent 
      :model-value="modelValue"
      :disabled="readonly"
      @update:model-value="updateModelValue"
    />
  </template>
</YamlFormEditor>
```

**Type Conversion:**
```typescript
// Handled automatically via convertType() function
```

This README serves as both comprehensive developer documentation and LLM context for understanding the entire YAML Form Editor system.
