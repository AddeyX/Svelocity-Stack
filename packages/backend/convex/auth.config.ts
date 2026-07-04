/* eslint-disable no-var */
// The Convex runtime provides process.env — declare it for TypeScript.
declare var process: { env: Record<string, string | undefined> };

export default {
	providers: [
		{
			domain: process.env.CONVEX_SITE_URL,
			applicationID: 'convex'
		}
	]
};
