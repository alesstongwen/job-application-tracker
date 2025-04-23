import { Hono } from "hono";
import { kindeClient, sessionManager } from "../kinde";
import { getUser } from "../kinde";

export const authRoute = new Hono()
    .get("/login", async (c) => {
        const loginUrl = await kindeClient.login(sessionManager(c));
        return c.redirect(loginUrl.toString());
    })
    .get("/register", async (c) => {
        const registerUrl = await kindeClient.register(sessionManager(c));
        return c.redirect(registerUrl.toString());
    })
    .get("/callback", async (c) => {
        const url = new URL(c.req.url);
    
        try {
            const manager = sessionManager(c);
            await kindeClient.handleRedirectToApp(manager, url);
    
            const frontendURL = Bun.env.FRONTEND_URL || "http://localhost:5173";
            return c.redirect(`${frontendURL}/profile`);
        } catch (error) {
            console.error("Fail getting the token:", error);
            return c.text("Unauthorized", 500);
        }
    })
    
    
    .get("/logout", async (c) => {
        const logoutUrl = await kindeClient.logout(sessionManager(c));
    
        // If Kinde gives you a URL, this is fine
        return c.redirect(logoutUrl.toString());
    })
    
    .get("/me", getUser, async (c) => {
        const user = c.var.user
        return c.json({ user });
      });