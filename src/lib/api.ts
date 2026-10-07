export type SafeUser = { id: number; username: string; email: string };

export type PostItem = {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  commentCount?: number;
};

export type CommentItem = {
  id: number;
  content: string;
  postId: number;
  authorId: number;
  authorName: string;
  createdAt: string;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const AUTH_EXPIRED_EVENT = "loudblog:auth-expired";

/* ------------------------------------------------------------------ */
/* Token storage – layered so auth survives even when the preview is  */
/* embedded in an iframe where cookies / web storage are blocked.     */
/*   1. in-memory (always works for the lifetime of the page)         */
/*   2. localStorage  (persists across tabs + reloads)                */
/*   3. sessionStorage                                                 */
/*   4. window.name   (survives reloads even with storage blocked)    */
/* ------------------------------------------------------------------ */

const TOKEN_KEY = "blog_token";
const NAME_PREFIX = "__loudblog_token__:";
let memoryToken: string | null = null;

function tryGet(fn: () => string | null): string | null {
  try {
    return fn() || null;
  } catch {
    return null;
  }
}
function trySet(fn: () => void) {
  try {
    fn();
  } catch {
    /* storage unavailable in this context */
  }
}

export function getToken(): string | null {
  if (memoryToken) return memoryToken;
  if (typeof window === "undefined") return null;

  const t =
    tryGet(() => window.localStorage.getItem(TOKEN_KEY)) ??
    tryGet(() => window.sessionStorage.getItem(TOKEN_KEY)) ??
    tryGet(() =>
      window.name.startsWith(NAME_PREFIX)
        ? window.name.slice(NAME_PREFIX.length)
        : null
    );

  if (t) memoryToken = t;
  return t;
}

export function setToken(token: string | null) {
  memoryToken = token;
  if (typeof window === "undefined") return;

  if (token) {
    trySet(() => window.localStorage.setItem(TOKEN_KEY, token));
    trySet(() => window.sessionStorage.setItem(TOKEN_KEY, token));
    trySet(() => {
      window.name = NAME_PREFIX + token;
    });
  } else {
    trySet(() => window.localStorage.removeItem(TOKEN_KEY));
    trySet(() => window.sessionStorage.removeItem(TOKEN_KEY));
    trySet(() => {
      if (window.name.startsWith(NAME_PREFIX)) window.name = "";
    });
  }
}

/* ------------------------------------------------------------------ */

export type Transports = {
  authorization: boolean;
  header: boolean;
  query: boolean;
  cookie: boolean;
};

export type MeResponse = {
  user: SafeUser | null;
  transports?: Transports;
  tokenPresent?: boolean;
};

/**
 * Attach the session token through every channel the server accepts.
 * Proxies / iframe sandboxes sometimes strip `Authorization` or cookies,
 * so we belt-and-braces it: Authorization header + custom header + query.
 */
function withToken(url: string, token: string | null): string {
  if (!token) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}token=${encodeURIComponent(token)}`;
}

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(withToken(url, token), {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      ...(token
        ? { Authorization: `Bearer ${token}`, "X-Session-Token": token }
        : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as T & { error?: string };

  if (!res.ok) {
    // A 401 on a non-auth endpoint while we hold a token means the session
    // is gone (expired / revoked / never stuck). Tell the app so it can
    // drop the stale "logged in" state instead of silently failing.
    if (
      res.status === 401 &&
      token &&
      !url.startsWith("/api/auth/") &&
      typeof window !== "undefined"
    ) {
      setToken(null);
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    throw new ApiError(
      res.status === 401
        ? (data.error ?? "Please log in to continue")
        : (data.error ?? "Request failed"),
      res.status
    );
  }
  return data;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
