#!/usr/bin/env node
/**
 * Constellation Manifest Validator
 * Validates celestials.json against the JSON schema
 */

const fs = require('fs');
const path = require('path');

// Simple JSON Schema validator (subset of draft-07)
function validate(data, schema, path = '') {
  const errors = [];

  if (schema.type) {
    const actualType = Array.isArray(data) ? 'array' : typeof data;
    if (schema.type !== actualType && !(schema.type === 'integer' && Number.isInteger(data))) {
      errors.push(`${path || 'root'}: expected ${schema.type}, got ${actualType}`);
      return errors;
    }
  }

  if (schema.required && schema.type === 'object') {
    for (const req of schema.required) {
      if (!(req in data)) {
        errors.push(`${path || 'root'}: missing required property '${req}'`);
      }
    }
  }

  if (schema.properties && typeof data === 'object' && !Array.isArray(data)) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (key in data) {
        errors.push(...validate(data[key], propSchema, `${path}.${key}`));
      }
    }
  }

  if (schema.items && Array.isArray(data)) {
    data.forEach((item, i) => {
      const itemSchema = schema.items.$ref 
        ? resolveRef(schema.items.$ref, rootSchema)
        : schema.items;
      errors.push(...validate(item, itemSchema, `${path}[${i}]`));
    });
  }

  if (schema.minItems && Array.isArray(data) && data.length < schema.minItems) {
    errors.push(`${path}: array has ${data.length} items, minimum is ${schema.minItems}`);
  }

  if (schema.pattern && typeof data === 'string') {
    if (!new RegExp(schema.pattern).test(data)) {
      errors.push(`${path}: '${data}' does not match pattern ${schema.pattern}`);
    }
  }

  if (schema.enum && !schema.enum.includes(data)) {
    errors.push(`${path}: '${data}' is not one of: ${schema.enum.join(', ')}`);
  }

  return errors;
}

let rootSchema;

function resolveRef(ref, schema) {
  const parts = ref.replace('#/', '').split('/');
  let current = schema;
  for (const part of parts) {
    current = current[part];
  }
  return current;
}

// Main
const manifestPath = path.join(__dirname, '../apps/novabot/public/celestials.json');
const schemaPath = path.join(__dirname, '../apps/novabot/public/schema/constellation-v2.json');

try {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  rootSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  
  console.log('🔍 Validating constellation manifest...\n');
  console.log(`   Version: ${manifest.version}`);
  console.log(`   Last Updated: ${manifest.last_updated}`);
  console.log(`   Celestials: ${manifest.celestials.length}`);
  console.log('');

  const errors = validate(manifest, rootSchema);
  
  // Additional semantic checks
  const ids = new Set();
  for (const c of manifest.celestials) {
    if (ids.has(c.id)) {
      errors.push(`Duplicate celestial ID: ${c.id}`);
    }
    ids.add(c.id);
    
    if (!c.thinking_messages || c.thinking_messages.length < 3) {
      errors.push(`${c.id}: needs at least 3 thinking_messages (has ${c.thinking_messages?.length || 0})`);
    }
  }

  if (errors.length === 0) {
    console.log('✅ Manifest is valid!\n');
    
    // Summary
    console.log('📊 Summary:');
    for (const c of manifest.celestials) {
      const status = c.status === 'operational' ? '🟢' : c.status === 'emerging' ? '🟡' : '⚪';
      console.log(`   ${status} ${c.name} (${c.id}) - ${c.thinking_messages?.length || 0} thinking messages`);
    }
    process.exit(0);
  } else {
    console.log('❌ Validation errors:\n');
    errors.forEach(e => console.log(`   • ${e}`));
    process.exit(1);
  }
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
