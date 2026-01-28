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
    <YamlForm v-model="data" />
</template>
```

### With Custom Field Types

```vue
<script setup lang="ts">
import type { YamlFieldType } from './useYamlFieldTypes'

const customTypes: YamlFieldType[] = [
    {
        type: 'image',
        label: 'Image',
        icon: 'i-lucide-image',
        defaultValue: '',
        component: 'image'
    }
]

const data = ref({
    title: 'Article',
    banner: '/images/banner.jpg'
})
</script>

<template>
    <YamlForm v-model="data" :field-types="customTypes">
        <template #field-image="{ modelValue, readonly }">
            <MyImagePicker v-model="modelValue" :disabled="readonly" />
        </template>
    </YamlForm>
</template>
```

## Architecture

### Component Hierarchy

```
YamlForm.vue (Entry Point)
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
        ├── Collapsible (objects/arrays)
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
YamlForm (v-model)
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

### YamlForm

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
<template #field-{component}="{ modelValue, readonly, valueType }">
    <!-- Your custom component -->
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

Same as YamlForm - all custom field slots are forwarded.

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
<template #field-{component}="{ modelValue, readonly, valueType }">
    <!-- Custom input component -->
</template>
```

## Field Types

### Type Definition

```typescript
interface YamlFieldType {
    type: string              // Unique type identifier
    label: string             // Display name in dropdowns
    icon: string              // Lucide icon name (i-lucide-*)
    defaultValue: any         // Default value or factory function
    component?: string        // Optional: slot name for custom rendering
    detect?: (value: any) => boolean  // Optional: auto-detection function
}
```

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
        detect: (value) => typeof value === 'string' && value.startsWith('http')
    }
]
```

```vue
<YamlForm v-model="data" :field-types="customTypes" />
```

### Adding a Runtime Type (With Custom Component)

```typescript
const customTypes: YamlFieldType[] = [
    {
        type: 'color',
        label: 'Color',
        icon: 'i-lucide-palette',
        defaultValue: '#000000',
        component: 'color',  // Enables slot
        detect: (value) => /^#[0-9A-Fa-f]{6}$/.test(value)
    }
]
```

```vue
<YamlForm v-model="data" :field-types="customTypes">
    <template #field-color="{ modelValue, readonly }">
        <input 
            type="color" 
            v-model="modelValue"
            :disabled="readonly"
            class="w-full h-10 rounded"
        />
    </template>
</YamlForm>
```

### Overriding Built-in Types

```typescript
const customTypes: YamlFieldType[] = [
    {
        type: 'string',  // Same as built-in
        label: 'Rich Text',
        icon: 'i-lucide-file-text',
        defaultValue: '',
        component: 'richtext'  // Now uses custom component
    }
]
```

```vue
<YamlForm v-model="data" :field-types="customTypes">
    <template #field-richtext="{ modelValue, readonly }">
        <MyRichTextEditor v-model="modelValue" :read-only="readonly" />
    </template>
</YamlForm>
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
    <YamlForm v-model="config" />
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
    <YamlForm v-model="article" />
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
    <YamlForm v-model="data" />
</template>
```

### With Custom Types

```vue
<script setup lang="ts">
import type { YamlFieldType } from './useYamlFieldTypes'

// Define custom types
const customTypes: YamlFieldType[] = [
    {
        type: 'image',
        label: 'Image',
        icon: 'i-lucide-image',
        defaultValue: '',
        component: 'image'
    },
    {
        type: 'markdown',
        label: 'Markdown',
        icon: 'i-lucide-file-text',
        defaultValue: '',
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
    <YamlForm v-model="post" :field-types="customTypes">
        <!-- Image picker component -->
        <template #field-image="{ modelValue, readonly }">
            <MyImagePicker 
                v-model="modelValue" 
                :disabled="readonly"
            />
        </template>
        
        <!-- Markdown editor component -->
        <template #field-markdown="{ modelValue, readonly }">
            <MyMarkdownEditor 
                v-model="modelValue"
                :read-only="readonly"
            />
        </template>
    </YamlForm>
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
        detect: (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(v)
    },
    {
        type: 'timestamp',
        label: 'Timestamp',
        icon: 'i-lucide-clock',
        defaultValue: () => new Date().toISOString()
    }
]
</script>

<template>
    <YamlForm v-model="data" :field-types="customTypes" />
</template>
```

### Read-only Mode

```vue
<template>
    <YamlForm v-model="data" readonly />
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
    <YamlForm v-model="complexData" />
</template>
```

## File Structure

```
components/
├── YamlForm.vue                           ← Entry component
├── YamlFormField.vue                      ← Recursive field component
├── YamlFieldInput.vue                     ← Input rendering component
└── Collapsible.vue                        ← Collapsible UI component

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

Slots are automatically forwarded through the component hierarchy:

```
YamlForm (defines slot)
    ↓ forwards
YamlFormField (forwards slot)
    ↓ forwards
YamlFieldInput (uses slot)
```

This allows custom components to work at any nesting level.

### Type Priority

When multiple types have `detect` functions that match:

1. Types are checked in array order
2. First matching type wins
3. More specific types should come before general types

**Example order:**
```typescript
[
    { type: 'datetime', detect: (v) => isDateTimeString(v) },  // Specific
    { type: 'date', detect: (v) => isDateString(v) },         // Less specific
    { type: 'string', detect: (v) => typeof v === 'string' }  // General
]
```

### Performance Considerations

**Reactivity:**
- Uses Vue 3 `ref` and `computed` for optimal reactivity
- Deep watching is used only where necessary
- Recursive rendering is optimized with `v-if` conditionals

**Large Arrays:**
- Each array item is independently reactive
- Adding/removing items doesn't re-render siblings
- Collapsible sections prevent rendering hidden content

**Memory:**
- Date helper functions are minimal
- No global state except type registry
- Components clean up properly on unmount

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

- **YamlForm**: Entry point component for the editor
- **YamlFormField**: Recursive component handling individual fields
- **YamlFieldInput**: Input rendering component for simple types
- **useYamlFieldTypes**: Composable for type registry and management
- **Collapsible**: UI component for collapsible sections

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
<YamlForm>
  <template #field-{type}="props">
    <Component v-bind="props" />
  </template>
</YamlForm>
```

**Type Conversion:**
```typescript
// Handled automatically via convertType() function
```

This README serves as both comprehensive developer documentation and LLM context for understanding the entire YAML Form Editor system.
