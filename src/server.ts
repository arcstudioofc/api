import { openapi } from "@elysiajs/openapi";
import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
// import { node } from "@elysiajs/node";
import z from "zod";

import { env } from "./config/env.js";
import { betterAuthPlugin, OpenAPI } from "./http/plugins/better-auth.js";
import { logger } from "./utils/logger.js";
import PKG from "../package.json" with { type: "json" };

export default new Elysia({
  name: "ARC Studio, API.",
  // adapter: node()
})
  // .onError((err) => {
  //   if (err.code === "NOT_FOUND") {
  //     return {
  //       status: 404,
  //       message: "Route not found.",
  //     };
  //   }
  // })
  .use(
    cors({
      origin: [env.WEB_APP_URL, env.WEB_URL, env.WEB_DEV_URL],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(
    openapi({
      // enabled: process.env.NODE_ENV !== "production",
      mapJsonSchema: {
        zod: z.toJSONSchema,
      },
      documentation: {
        info: {
          title: "ARC Studio, API.",
          version: PKG.version,
          description: "Principal API for ARC Studio, Inc.",
        },

        components: OpenAPI.components as any,
        paths: OpenAPI.getPaths() as any,

        tags: [
          { name: "Default", description: "Default routes" },
          {
            name: "Auth system",
            description: "System authentication for users in routes",
          },
        ],
      },
    }),
  )
  .use(betterAuthPlugin)
  .get(
    "/",
    () => ({
      message: "Hello, ARC.",
    }),
    {
      detail: {
        summary: "/",
        tags: ["Default"],
      },
    },
  )
  .get(
    "/me",
    ({ user }) => {
      const { id, name, email, emailVerified, role } = user;

      return {
        id,
        name,
        email,
        emailVerified,
        role,
      };
    },
    {
      auth: true,
      detail: {
        summary: "/me",
        tags: ["Default"],
      },
      response: {
        201: z.object({
          id: z.string(),
          name: z.string(),
          email: z.email(),
          emailVerified: z.boolean(),
          role: z.string(),
        }),
        401: z.object({
          message: z.string().default("not authenticated"),
        }),
      },
    },
  )
  .listen({ port: env.DEFAULT_PORT }, (info) => {
    logger(`🔥 api is running at ${info.hostname}:${info.port}`);
  });
