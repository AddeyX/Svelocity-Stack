export function parseDefaultCatalog(yaml: string): Record<string, string>;

type DependencyBlock = Record<string, string>;

export interface PackManifest {
	dependencies?: DependencyBlock;
	devDependencies?: DependencyBlock;
	optionalDependencies?: DependencyBlock;
	peerDependencies?: DependencyBlock;
	publishConfig?: { registry: string; access: string };
}

export function rewriteManifest(
	manifest: PackManifest,
	catalog: Record<string, string>,
	workspacePackages: Map<string, { private: boolean }>
): PackManifest & {
	devDependencies: DependencyBlock;
	publishConfig: { registry: string; access: string };
};

export function loadDefaultCatalog(root?: string): Record<string, string>;

export function loadWorkspacePackages(root?: string): Map<string, { private: boolean }>;

export function prepack(): void;

export function postpack(): void;
