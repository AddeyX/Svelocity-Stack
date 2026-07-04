import { Password } from '@convex-dev/auth/providers/Password';
import { convexAuth } from '@convex-dev/auth/server';

// V1 golden path: email + password only (ADR 0002). OAuth lands in v1.1.
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [Password]
});
