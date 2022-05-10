import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import prisma from "../../../helpers/db"
import { PrismaAdapter } from "@next-auth/prisma-adapter"

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    /* EmailProvider({
         server: process.env.EMAIL_SERVER,
         from: process.env.EMAIL_FROM,
       }),
    // Temporarily removing the Apple provider from the demo site as the
    // callback URL for it needs updating due to Vercel changing domains
      
    Providers.Apple({
      clientId: process.env.APPLE_ID,
      clientSecret: {
        appleId: process.env.APPLE_ID,
        teamId: process.env.APPLE_TEAM_ID,
        privateKey: process.env.APPLE_PRIVATE_KEY,
        keyId: process.env.APPLE_KEY_ID,
      },
    }),
    */

    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    })
  ],
  theme: {
    colorScheme: "auto",
    brandColor: "#ff7852",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      let userInfo = await prisma.user.findFirst({
        where: {
          email: user.email,
        },
      })

      token.publicId = userInfo.id
      return token
    },

  },
})