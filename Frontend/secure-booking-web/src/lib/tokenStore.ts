// In-memory-only access token storage. Never persisted (localStorage/sessionStorage)
// so an XSS payload can't read it back out after the page reloads.
let accessToken: string | null = null;

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export const tokenStore = {
  get: () => accessToken,

  set: (token: string | null) => {
    accessToken = token;
  },

  clear: () => {
    accessToken = null;
  },

  onUnauthorized: (handler: UnauthorizedHandler | null) => {
    unauthorizedHandler = handler;
  },

  notifyUnauthorized: () => {
    unauthorizedHandler?.();
  },
};
