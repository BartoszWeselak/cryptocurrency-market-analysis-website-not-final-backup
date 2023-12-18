import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import { env } from "~/env.mjs";
import { db } from "~/server/db";
import { z } from "zod";

import { loginSchema } from "~/schemes/currency-schemes";
/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;

      role: UserRole;
    };
  }

  interface User {
    role: UserRole;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user, token }) => ({
      ...session,

      user: {
        ...session.user,
        ...token.user,
        // id: token.id,
        // role: user.role,
      },
    }),

    jwt: ({ token, user }) => {
      if (user) {
        token.user = user;
        //   token.id = user.id;
        //   token.email = user.email;
      }

      return token;
    },
  },

  adapter: PrismaAdapter(db),
  secret: env.NEXTAUTH_SECRET,
  debug: true,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Sign in",
      id: "Sign in",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          value: "admin@gmail.com",
          placeholder: "example@gmail.com",
        },
        password: { label: "Password", type: "password", value: "12345" },
      },

      authorize: async (credentials) => {
        const cred = await loginSchema.parseAsync(credentials);

        const user = await db.user.findFirst({
          where: { email: cred.email },
        });
        if (!user) {
          return null;
        }
        if (!user.password) {
          return null;
        }
        const isValidPassword = bcrypt.compareSync(
          cred.password,
          user.password as string,
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
    Credentials({
      name: "Sign up",
      id: "Sign up",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          value: "admin@gmail.com",
          placeholder: "example@gmail.com",
        },
        password: { label: "Password", type: "password", value: "12345" },
      },

      authorize: async (credentials) => {
        const cred = await loginSchema.parseAsync(credentials);

        const user = await db.user.findFirst({
          where: { email: cred.email },
        });
        if (user) {
          return null;
        }
        const hashedPassword = bcrypt.hashSync(cred.password, 10);

        const newUser = await db.user.create({
          data: { email: cred.email, password: hashedPassword },
        });

        if (!newUser) {
          return null;
        }

        return {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,

          role: newUser.role,
        };
      },
    }),

    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
