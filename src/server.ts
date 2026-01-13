import openapi from "@elysiajs/openapi";
import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import z from "zod";

import { env } from "@/config/env";
import { betterAuthPlugin, OpenAPI } from "@/http/plugins/better-auth";
import { logger } from "@/utils/logger";
import PKG from "../package.json";

export const app = new Elysia({ name: "ARC Studio, API." })
  .use(
    cors({
      origin: [env.WEB_APP_URL, env.WEB_URL, env.WEB_DEV_URL],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
  .use(
    openapi({
      mapJsonSchema: {
        zod: z.toJSONSchema,
      },
      documentation: {
        info: {
          title: "ARC Studio, API.",
          version: PKG.version,
          description: "Principal API for ARC Studio, Inc.",
        },
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
        tags: [
          { name: "Default", description: "Default routes" },
          {
            name: "Auth system",
            description: "System authentication for users in routes",
          },
          // { name: "Models", description: "Users, Sessions, etc... for models" },
        ],
      },
    })
  )
  .use(betterAuthPlugin)
  .get(
    "/",
    () => {
      return {
        message: `Hello, ARC.`,
      };
    },
    {
      detail: {
        summary: "/",
        tags: ["Default"],
      },
    }
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
      // return user;
    },
    {
      auth: true,
      detail: {
        summary: "/me",
        tags: ["Default"],
      },
      // params: z.object({
      //   id: z.string(),
      // }),
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
    }
  )
  .listen(
    {
      port: env.DEFAULT_PORT,
    },
    (info) => {
      logger(`🔥 api is running at ${info.hostname}:${info.port}`);
    }
  );
function readFileSync(arg0: string): BodyInit | null | undefined {
  throw new Error("Function not implemented.");
}

