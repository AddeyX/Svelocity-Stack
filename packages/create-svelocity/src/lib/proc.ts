import { spawn } from 'node:child_process';

export function run(
	cmd: string,
	args: string[],
	opts: { cwd?: string; inherit?: boolean } = {}
): Promise<{ code: number; stdout: string }> {
	return new Promise((resolve, reject) => {
		const child = spawn(cmd, args, {
			cwd: opts.cwd,
			stdio: opts.inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'],
			shell: process.platform === 'win32'
		});
		let stdout = '';
		child.stdout?.on('data', (chunk: Buffer) => (stdout += chunk.toString()));
		child.on('error', reject);
		child.on('close', (code) => resolve({ code: code ?? 1, stdout: stdout.trim() }));
	});
}

export async function commandVersion(cmd: string): Promise<string | null> {
	try {
		const { code, stdout } = await run(cmd, ['--version']);
		return code === 0 ? stdout : null;
	} catch {
		return null;
	}
}
