import { httpRouter } from 'convex/server';
import { auth } from './auth';

const http = httpRouter();

// Mounts /.well-known/openid-configuration + jwks (and OAuth callbacks if
// OAuth providers are ever added in auth.ts).
auth.addHttpRoutes(http);

export default http;
