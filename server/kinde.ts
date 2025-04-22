import {
    createKindeServerClient,
    GrantType,
    type SessionManager,
    type UserType,
    type UserProfile
} from "@kinde-oss/kinde-typescript-sdk";
import { type Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { z } from "zod";
if (process.env.NODE_ENV !== 'production') {
    import('dotenv').then(dotenv => dotenv.config());
 }

 console.log('ENV CHECK:', {
    KINDE_ISSUER_URL: process.env.KINDE_ISSUER_URL,
    KINDE_CLIENT_ID: process.env.KINDE_CLIENT_ID
  });
const KindeEnv = z.object({
    KINDE_ISSUER_URL: z.string().url(), 
    KINDE_CLIENT_ID: z.string(),       
    KINDE_CLIENT_SECRET: z.string(),   
    KINDE_REDIRECT_URI: z.string().url(), 
    KINDE_POST_LOGOUT_REDIRECT_URL: z.string().url(), 
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
        console.log(`Cookie Retrieved [${key}]:`, result); // Debugging log
        return result || null;
    },
    async setSessionItem(key: string, value: unknown) {
        console.log(`Setting Cookie [${key}]:`, value); // Debugging log
        const cookieOptions = {
            httpOnly: true,
            secure: false, // testing locally -> false 
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
        ["ac-state-key"].forEach((key) => {
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
        console.log("Is Authenticated:", isAuthenticated);

        if (!isAuthenticated) {
            console.error("User is not authenticated.");
            return c.json({ error: "Unauthorized" }, 401);
        }
        // const user = await kindeClient.getUserProfile(manager);

        const userProfile = await kindeClient.getUserProfile(manager);
        const user: UserType = {
            id: userProfile.id,
            email: userProfile.email,
            given_name: userProfile.given_name,
            family_name: userProfile.family_name,
            picture: userProfile.picture,
          };
        console.log("User Profile:", user);

        c.set("user", user);
        await next();
    } catch (e) {
        console.error("Error in getUser middleware:", e);
        return c.json({ error: "Unauthorized" }, 401);
    }
  });

  console.log('KINDE_ISSUER_URL:', process.env.KINDE_ISSUER_URL);