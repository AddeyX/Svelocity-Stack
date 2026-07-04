import colors from 'picocolors';

export { colors };

export type CheckStatus = 'pass' | 'warn' | 'fail';

export function glyph(status: CheckStatus): string {
	if (status === 'pass') return colors.green('✓');
	if (status === 'warn') return colors.yellow('▲');
	return colors.red('✗');
}
