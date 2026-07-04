#!/usr/bin/env node
/**
 * Validate a Svelocity manifest against .svelocity/manifest.schema.json.
 * Dependency-free: implements exactly the JSON Schema subset the schema uses
 * (type, required, properties, additionalProperties, enum, pattern, items,
 * minItems, uniqueItems).
 *
 * Usage: node scripts/validate-manifest.mjs [path/to/manifest.json]
 * Defaults to .svelocity/manifest.example.json (and validates .svelocity/manifest.json if present).
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const schema = JSON.parse(readFileSync(resolve(root, '.svelocity/manifest.schema.json'), 'utf8'));

function validate(value, node, path, errors) {
	if (node.enum && !node.enum.includes(value)) {
		errors.push(`${path}: expected one of [${node.enum.join(', ')}], got ${JSON.stringify(value)}`);
		return;
	}
	if (node.type === 'object') {
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			errors.push(`${path}: expected object`);
			return;
		}
		for (const key of node.required ?? []) {
			if (!(key in value)) errors.push(`${path}.${key}: required property missing`);
		}
		for (const [key, child] of Object.entries(value)) {
			const childSchema = node.properties?.[key];
			if (!childSchema) {
				if (node.additionalProperties === false && key !== '$schema') {
					errors.push(`${path}.${key}: unknown property`);
				}
				continue;
			}
			validate(child, childSchema, `${path}.${key}`, errors);
		}
	} else if (node.type === 'array') {
		if (!Array.isArray(value)) {
			errors.push(`${path}: expected array`);
			return;
		}
		if (node.minItems !== undefined && value.length < node.minItems) {
			errors.push(`${path}: expected at least ${node.minItems} item(s)`);
		}
		if (node.uniqueItems && new Set(value.map((v) => JSON.stringify(v))).size !== value.length) {
			errors.push(`${path}: items must be unique`);
		}
		if (node.items) value.forEach((item, i) => validate(item, node.items, `${path}[${i}]`, errors));
	} else if (node.type === 'string') {
		if (typeof value !== 'string') {
			errors.push(`${path}: expected string`);
			return;
		}
		if (node.pattern && !new RegExp(node.pattern).test(value)) {
			errors.push(`${path}: ${JSON.stringify(value)} does not match ${node.pattern}`);
		}
	}
}

function validateFile(file) {
	const manifest = JSON.parse(readFileSync(file, 'utf8'));
	const errors = [];
	validate(manifest, schema, 'manifest', errors);
	if (errors.length) {
		console.error(`✗ ${file}`);
		for (const e of errors) console.error(`  ${e}`);
		return false;
	}
	console.log(`✓ ${file}`);
	return true;
}

const targets = process.argv[2]
	? [resolve(process.argv[2])]
	: [
			resolve(root, '.svelocity/manifest.example.json'),
			...(existsSync(resolve(root, '.svelocity/manifest.json'))
				? [resolve(root, '.svelocity/manifest.json')]
				: [])
		];

const ok = targets.map(validateFile).every(Boolean);
process.exit(ok ? 0 : 1);
