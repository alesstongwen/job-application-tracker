import {
    createKindeServerClient,
    GrantType,
    type SessionManager,
    type UserType,
} from "@kinde-oss/kinde-typescript-sdk";
import { type Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { z } from "zod";
import dotenv from 'dotenv';

dotenv.config();

// Validate environment variables with zod
const KindeEnv = z.object({
    KINDE_ISSUER_URL: z.string().url(), // Your issuer URL
    KINDE_CLIENT_ID: z.string(),       // Client ID
    KINDE_CLIENT_SECRET: z.string(),   // Client Secret
    KINDE_REDIRECT_URI: z.string().url(), // Redirect URI
    KINDE_POST_LOGOUT_REDIRECT_URL: z.string().url(), // Post Logout Redirect URI
});

// Parse and validate process.env
const ProcessEnv = KindeEnv.parse(process.env);

// Create Kinde server client for Authorization Code Flow
export const kindeClient = createKindeServerClient(GrantType.AUTHORIZATION_CODE, {
    authDomain: ProcessEnv.KINDE_ISSUER_URL,        
    clientId: ProcessEnv.KINDE_CLIENT_ID,           
    clientSecret: ProcessEnv.KINDE_CLIENT_SECRET,   
    redirectURL: ProcessEnv.KINDE_REDIRECT_URI,     
    logoutRedirectURL: ProcessEnv.KINDE_POST_LOGOUT_REDIRECT_URL, 
});

// Session Manager for managing cookies
export const sessionManager = (c: Context): SessionManager => ({
    async getSessionItem(key: string) {
        const result = getCookie(c, key);
        return result || null; 
    },
    async setSessionItem(key: string, value: unknown) {
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: "Lax",
        } as const;
        if (typeof value === "string") {
            setCookie(c, key, value, cookieOptions);
        } else {
            setCookie(c, key, JSON.stringify(value), cookieOptions);
        }
    },
    async removeSessionItem(key: string) {
        deleteCookie(c, key);
    },
    async destroySession() {
        ["id_token", "access_token", "user", "refresh_token"].forEach((key) => {
            deleteCookie(c, key);
        });
    },
});

// Define Environment Variables for Hono Middleware
type Env = {
    Variables: {
        user: UserType;
    };
};

// Middleware for User Authentication
export const getUser = createMiddleware<Env>(async (c, next) => {
    try {
        const manager = sessionManager(c);
        const isAuthenticated = await kindeClient.isAuthenticated(manager);
        if (!isAuthenticated) {
            return c.json({ error: "Unauthorized" }, 401);
        }
        const user = await kindeClient.getUserProfile(manager);
        c.set("user", user); // Set the authenticated user in the context
        await next();
    } catch (e) {
        console.error("Error in getUser middleware:", e);
        return c.json({ error: "Unauthorized" }, 401);
    }
});