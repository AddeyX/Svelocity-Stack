import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(path.join(root, relativePath), 'utf8');

const checks = [];

function check(name, condition, detail) {
	checks.push({ name, pass: Boolean(condition), detail });
}

const tasks = read('packages/backend/convex/tasks.ts');
check(
	'Convex task functions derive server identity',
	tasks.includes('getAuthUserId(ctx)') && tasks.includes('requireUserId(ctx)'),
	'Expected getAuthUserId and requireUserId in packages/backend/convex/tasks.ts'
);
check(
	'Convex task mutations enforce ownership',
	tasks.includes('requireOwnTask(ctx, taskId)'),
	'Expected requireOwnTask usage for task mutations'
);
check(
	'Convex task titles use shared server validation',
	tasks.includes('taskTitleSchema.safeParse(title)'),
	'Expected taskTitleSchema.safeParse in create/update mutations'
);

const electronMain = read('apps/desktop/electron/main.ts');
check(
	'Electron renderer isolation is explicit',
	/contextIsolation:\s*true/.test(electronMain) &&
		/nodeIntegration:\s*false/.test(electronMain) &&
		/sandbox:\s*true/.test(electronMain),
	'Expected contextIsolation=true, nodeIntegration=false, sandbox=true'
);

const electronPreload = read('apps/desktop/electron/preload.ts');
check(
	'Electron preload does not expose raw ipcRenderer',
	!/(?:ipcRenderer\s*[:,]|exposeInMainWorld\([^)]*ipcRenderer)/s.test(electronPreload),
	'Expose audited wrapper methods only'
);

const urlSafety = read('apps/desktop/electron/url-safety.ts');
check(
	'Electron external links allow only HTTP(S)',
	urlSafety.includes("url.protocol === 'https:'") && urlSafety.includes("url.protocol === 'http:'"),
	'Expected explicit http: and https: protocol allowlist'
);

const androidManifest = read('apps/mobile/android/app/src/main/AndroidManifest.xml');
const androidPermissions = [
	...androidManifest.matchAll(/<uses-permission\s+android:name="([^"]+)"/g)
].map((match) => match[1]);
check(
	'Android requests only internet permission',
	androidPermissions.length === 1 && androidPermissions[0] === 'android.permission.INTERNET',
	`Found permissions: ${androidPermissions.join(', ') || 'none'}`
);

const mobilePackage = JSON.parse(read('apps/mobile/package.json'));
check(
	'Capacitor filesystem plugin is absent',
	!Object.keys({
		...mobilePackage.dependencies,
		...mobilePackage.devDependencies
	}).some((name) => /filesystem/i.test(name)),
	'No filesystem dependency may ship in V1'
);

const webHooks = read('apps/web/src/hooks.server.ts');
for (const header of [
	'Strict-Transport-Security',
	'X-Content-Type-Options',
	'Referrer-Policy',
	'Permissions-Policy'
]) {
	check(
		`Web sets ${header}`,
		webHooks.includes(header),
		`Expected ${header} in apps/web/src/hooks.server.ts`
	);
}

const webConfig = read('apps/web/svelte.config.js');
check(
	'Web defines SvelteKit CSP',
	/\bcsp:\s*\{/.test(webConfig) &&
		webConfig.includes("'default-src'") &&
		webConfig.includes("'object-src'") &&
		webConfig.includes("'frame-ancestors'"),
	'Expected kit.csp with default-src, object-src, and frame-ancestors directives'
);

const trackedFiles = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' })
	.trim()
	.split('\n')
	.filter(Boolean);
const trackedPrivateEnv = trackedFiles.filter(
	(file) =>
		/(^|\/)\.env(?:\.local|\.production|\.development)?$/.test(file) && !file.endsWith('.example')
);
check(
	'No private environment file is tracked',
	trackedPrivateEnv.length === 0,
	`Tracked private env files: ${trackedPrivateEnv.join(', ') || 'none'}`
);

const clientPrivateEnvImports = trackedFiles
	.filter((file) =>
		/^(apps\/(?:web|desktop|mobile)|packages\/(?:ui|app-core|auth))\/.*\.[cm]?[jt]s$/.test(file)
	)
	.filter((file) => {
		const source = read(file);
		return source.includes('$env/static/private') || source.includes('$env/dynamic/private');
	});
check(
	'Client code imports no private SvelteKit environment module',
	clientPrivateEnvImports.length === 0,
	`Private env imports: ${clientPrivateEnvImports.join(', ') || 'none'}`
);

for (const result of checks) {
	const marker = result.pass ? 'PASS' : 'FAIL';
	console.log(`${marker} ${result.name}`);
	if (!result.pass) console.error(`     ${result.detail}`);
}

const failures = checks.filter((result) => !result.pass);
console.log(`\n${checks.length - failures.length}/${checks.length} security invariants passed.`);
if (failures.length > 0) process.exitCode = 1;
