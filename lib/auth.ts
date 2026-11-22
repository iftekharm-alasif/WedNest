
import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { MongoClient, ObjectId } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("wednestdb");
const users = db.collection("user");

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,

  database: mongodbAdapter(db, {
    client,
  }),

  emailAndPassword: {
    enabled: true,
  },

user: {
  additionalFields: {
    role: {
      type: "string",
      required: true,
      input: true,
    },
    businessName: {
      type: "string",
      required: false,
      input: false,
    },
    subscriptionPlan: {
      type: "string",
      required: false,
      input: false,
    },
    subscriptionExpiresAt: {
      type: "date",
      required: false,
      input: false,
    },
  },
},

  // Block banned users during email/password login
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-in/email") {
        const body = ctx.body as { email?: string } | undefined;
        const email = body?.email?.trim();

        if (email) {
          const user = await users.findOne({
            email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
          });

          if (user?.isBanned === true) {
            throw new APIError("FORBIDDEN", {
              message: "Your account has been banned. Please contact support.",
            });
          }
        }
      }
    }),
  },

  // Also prevent new sessions for banned users
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const userId = session.userId;

          const userFilter = ObjectId.isValid(userId)
            ? {
                $or: [
                  { _id: userId },
                  { _id: new ObjectId(userId) },
                ],
              }
            : { _id: userId };

          const user = await users.findOne(userFilter);

          if (user?.isBanned === true) {
            return false;
          }

          return {
            data: session,
          };
        },
      },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
