import { betterAuth } from "better-auth";
import { openAPI, username } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import argon2 from "argon2";

import { env } from "../env.js";

const client = new MongoClient(env.MONGODB_URI);
const db = client.db("api");

const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

export const auth = betterAuth({
  basePath: "/auth",
  trustedOrigins: [env.WEB_APP_URL, env.WEB_URL, env.WEB_DEV_URL],

  database: mongodbAdapter(db, {
    client,
    debugLogs: process.env.NODE_ENV === "development",
  }),

  plugins: [
    openAPI(),
    nextCookies(),
    username({
      minUsernameLength: 3,
      maxUsernameLength: 18,

      usernameValidator: (value) => {
        const username = value.trim().toLowerCase();
        return USERNAME_REGEX.test(username);
      },

      displayUsernameValidator: (value) => {
        const username = value.trim().toLowerCase();
        return USERNAME_REGEX.test(username);
      },
    }),
  ],

  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
    database: {
      generateId: "uuid",
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 120,
    password: {
      hash: (password) => argon2.hash(password),
      verify: ({ password, hash }) => argon2.verify(hash, password),
    },
  },

  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRECT,
    },
    vercel: {
      clientId: env.VERCEL_CLIENT_ID,
      clientSecret: env.VERCEL_CLIENT_SECRECT,
      scope: ["openid", "email", "profile"], 
    },
  },
});
