import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          // Find user by username
          const user = await prisma.user.findUnique({
            where: { 
              username: credentials.username,
              isActive: true
            }
          })

          if (!user) {
            return null
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(credentials.password, user.password)
          if (!isValidPassword) {
            return null
          }

          return {
            id: user.id,
            email: user.email || user.username, // For compatibility
            name: user.name,
            username: user.username,
            role: user.role
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Refresh token daily
  },
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.username = (user as any).username
        token.role = (user as any).role
      }
      
      // Handle session updates (when updateSession is called)
      if (trigger === "update" && session) {
        // Fetch fresh user data from database
        try {
          const prisma = new PrismaClient()
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string }
          })
          if (dbUser) {
            token.username = dbUser.username
            token.role = dbUser.role
          }
        } catch (error) {
          console.error('Error refreshing user data:', error)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string
        ;(session.user as any).username = token.username
        ;(session.user as any).role = token.role
      }
      return session
    }
  }
}