import { getAuthUserId } from '@convex-dev/auth/server';
import { query } from './_generated/server';

/** Profile of the signed-in user (null when signed out). */
export const me = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) return null;
		const user = await ctx.db.get(userId);
		if (!user) return null;
		return { _id: user._id, email: user.email ?? null, name: user.name ?? null };
	}
});
