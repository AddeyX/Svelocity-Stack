import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export interface Manifest {
	stackVersion: string;
	createdWith: string;
	targets: string[];
	ui: string;
	auth: string;
	backend: string;
	packageManager: string;
	aiTargets: string[];
	skills: string[];
}

interface SchemaNode {
	type?: string;
	enum?: unknown[];
	required?: string[];
	properties?: Record<string, SchemaNode>;
	additionalProperties?: boolean;
	items?: SchemaNode;
	minItems?: number;
	uniqueItems?: boolean;
	pattern?: string;
}

function validate(value: unknown, node: SchemaNode, path: string, errors: string[]): void {
	if (node.enum && !node.enum.includes(value)) {
		errors.push(`${path}: expected one of [${node.enum.join(', ')}], got ${JSON.stringify(value)}`);
		return;
	}
	if (node.type === 'object') {
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			errors.push(`${path}: expected object`);
			return;
		}
		const obj = value as Record<string, unknown>;
		for (const key of node.required ?? []) {
			if (!(key in obj) || obj[key] === undefined) {
				errors.push(`${path}.${key}: required property missing`);
			}
		}
		for (const [key, child] of Object.entries(obj)) {
			if (child === undefined) continue;
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
		if (node.items) {
			value.forEach((item, i) => validate(item, node.items as SchemaNode, `${path}[${i}]`, errors));
		}
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

export function validateAgainstSchema(value: unknown, schema: unknown): string[] {
	const errors: string[] = [];
	validate(value, schema as SchemaNode, 'manifest', errors);
	return errors;
}

export function findProjectRoot(startDir: string): string | null {
	let dir = startDir;
	for (;;) {
		if (existsSync(join(dir, '.svelocity/manifest.json'))) return dir;
		const parent = dirname(dir);
		if (parent === dir) return null;
		dir = parent;
	}
}

export function readManifest(projectRoot: string): { manifest: Manifest | null; errors: string[] } {
	const manifestPath = join(projectRoot, '.svelocity/manifest.json');
	let manifest: Manifest;
	try {
		manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest;
	} catch (error) {
		return { manifest: null, errors: [`could not read ${manifestPath}: ${String(error)}`] };
	}
	const schemaPath = join(projectRoot, '.svelocity/manifest.schema.json');
	if (!existsSync(schemaPath)) return { manifest, errors: [] };
	const schema = JSON.parse(readFileSync(schemaPath, 'utf8')) as unknown;
	return { manifest, errors: validateAgainstSchema(manifest, schema) };
}
