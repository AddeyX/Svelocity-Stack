import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { authTables } from '@convex-dev/auth/server';

export default defineSchema({
	// users, authAccounts, authSessions, authRefreshTokens, etc.
	...authTables,

	tasks: defineTable({
		userId: v.id('users'),
		title: v.string(),
		completed: v.boolean(),
		// _creationTime covers createdAt; this tracks the last mutation.
		updatedAt: v.number()
	}).index('by_user', ['userId'])
});
