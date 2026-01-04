import { betterAuth } from "better-auth";
import { openAPI, username, admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
// import { Resend } from "resend";
import { MongoClient } from "mongodb";
import argon2 from "argon2";

import { env } from "@/lib/env.js";

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
    admin(),
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
    // requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 120,
    password: {
      hash: (password) => argon2.hash(password),
      verify: ({ password, hash }) => argon2.verify(hash, password),
    },
  },

  // emailVerification: {
  //   sendOnSignInUp: true,
  //   sendVerificationEmail: async ({ user, url }) => {
  //     try {
  //       await new Resend(env.RESEND_API_KEY).emails.send({
  //         from: "ARC Studio, Inc. <no-reply@arcstudio.online>",
  //         to: user.email,
  //         subject: "Verify your email address",
  //         react: (
  //           await import("../email/verify-email.jsx")
  //         ).default({
  //           verifyUrl: url,
  //           username: user.name || "unknown",
  //         }),
  //       });
  //     } catch (err) {
  //       console.error("Email verification failed", err);
  //       throw err;
  //     }
  //   },
  // },

  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRECT,
    },
    // vercel: {
    //   clientId: env.VERCEL_CLIENT_ID,
    //   clientSecret: env.VERCEL_CLIENT_SECRECT,
    //   scope: ["openid", "email", "profile"],
    // },
  },
});
