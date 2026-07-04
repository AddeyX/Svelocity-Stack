import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { mutation, query, type MutationCtx, type QueryCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';
import { taskTitleSchema } from '@svelocity/app-core';

/** Every function requires an authenticated caller; ownership is enforced server-side. */
async function requireUserId(ctx: QueryCtx | MutationCtx): Promise<Id<'users'>> {
	const userId = await getAuthUserId(ctx);
	if (userId === null) throw new Error('Not authenticated');
	return userId;
}

async function requireOwnTask(ctx: MutationCtx, taskId: Id<'tasks'>) {
	const userId = await requireUserId(ctx);
	const task = await ctx.db.get(taskId);
	if (!task || task.userId !== userId) throw new Error('Task not found');
	return task;
}

/** Current user's tasks, newest first. */
export const list = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (userId === null) return [];
		return await ctx.db
			.query('tasks')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.order('desc')
			.collect();
	}
});

export const create = mutation({
	args: { title: v.string() },
	handler: async (ctx, { title }) => {
		const userId = await requireUserId(ctx);
		// Same rules the clients enforce — never trust the client copy.
		const parsed = taskTitleSchema.safeParse(title);
		if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Invalid title');
		return await ctx.db.insert('tasks', {
			userId,
			title: parsed.data,
			completed: false,
			updatedAt: Date.now()
		});
	}
});

export const setCompleted = mutation({
	args: { taskId: v.id('tasks'), completed: v.boolean() },
	handler: async (ctx, { taskId, completed }) => {
		await requireOwnTask(ctx, taskId);
		await ctx.db.patch(taskId, { completed, updatedAt: Date.now() });
	}
});

export const updateTitle = mutation({
	args: { taskId: v.id('tasks'), title: v.string() },
	handler: async (ctx, { taskId, title }) => {
		await requireOwnTask(ctx, taskId);
		const parsed = taskTitleSchema.safeParse(title);
		if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Invalid title');
		await ctx.db.patch(taskId, { title: parsed.data, updatedAt: Date.now() });
	}
});

export const remove = mutation({
	args: { taskId: v.id('tasks') },
	handler: async (ctx, { taskId }) => {
		await requireOwnTask(ctx, taskId);
		await ctx.db.delete(taskId);
	}
});
