import { betterAuth } from "better-auth"
import { createAuthMiddleware, APIError } from "better-auth/api"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { jwt } from "better-auth/plugins"

const client = await clientPromise
const db = client.db("wednestdb")

export const users = db.collection<{
  _id: string | ObjectId
  email?: string
  isBanned?: boolean
  role?: string
}>("user")

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    "http://localhost:3000",
    "https://wed-nest.vercel.app",
    "https://*.vercel.app",
  ],

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
        const body = ctx.body as { email?: string } | undefined
        const email = body?.email?.trim()

        if (email) {
          const user = await users.findOne({
            email: {
              $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
              $options: "i",
            },
          })

          if (user?.isBanned === true) {
            throw new APIError("FORBIDDEN", {
              message: "Your account has been banned. Please contact support.",
            })
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
          const userId = session.userId

          const userFilter = ObjectId.isValid(userId)
            ? {
                $or: [{ _id: userId }, { _id: new ObjectId(userId) }],
              }
            : { _id: userId }

          const user = await users.findOne(userFilter)

          if (user?.isBanned === true) {
            return false
          }

          return {
            data: session,
          }
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
  plugins: [jwt()],
})
