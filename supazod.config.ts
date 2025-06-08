import { defineConfig } from 'supazod';

export default defineConfig({
    namingConfig: {
        // TypeScript provides autocomplete for placeholders:
        // {schema}, {table}, {operation}, {function}, {name}
        tableOperationPattern: '{schema}_{table}_{operation}',
        enumPattern: '{schema}_{name}_Enum',
        functionArgsPattern: '{schema}_{function}_Args',
        functionReturnsPattern: '{schema}_{function}_Returns',

        // Capitalization and formatting
        capitalizeSchema: true,
        capitalizeNames: true,
        separator: '_',
    }
});