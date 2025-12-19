import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { node } from "@elysiajs/node";
import consola from "consola";
import chalk from "chalk";
import { cors } from "@elysiajs/cors";
import { z } from "zod";

import { betterAuthPlugins, OpenAPI } from "./http/plugins/better-auth.js";
import { env } from "./lib/env.js";

new Elysia({ adapter: node() })
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
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
      mapJsonSchema: {
        zod: z.toJSONSchema,
      },
    })
  )
  .use(betterAuthPlugins)
  .get("/", () => "Hello, World!", {
    detail: {
      tags: ["Default"],
    },
  })
  .get(
    "/users/{id}",
    ({ params, user }) => {
      const userId = params.id;

      const authenticatedUserName = user.name;

      console.log({ authenticatedUserName });

      return { id: userId, name: user.name };
    },
    {
      auth: true,
      detail: {
        summary: "/users/{id}",
        tags: ["Users"],
      },
      params: z.object({
        id: z.string(),
      }),
      response: {
        200: z.object({
          id: z.string(),
          name: z.string(),
        }),
      },
    }
  )
  .listen(env.PORT, ({ port }) => {
    consola.info(chalk(`Rodando na porta: ${chalk.bgBlueBright(port)}\n`));
    consola.success(
      chalk(`Servidor iniciado com ${chalk.bgGreenBright("sucesso")}`)
    );
  });
