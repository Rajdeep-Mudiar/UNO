import type { NextAuthOptions, DefaultSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/db';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role?: string;
      level?: number;
      rating?: number;
      coins?: number;
      gems?: number;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role?: string;
    level?: number;
    rating?: number;
    coins?: number;
    gems?: number;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      id: 'guest',
      name: 'Guest / Demo Player',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'CardMaster99' },
      },
      async authorize(credentials) {
        if (!credentials?.username) return null;
        
        const username = credentials.username.trim();
        
        // Find or create guest player for quick onboarding
        let user = await prisma.user.findFirst({
          where: { name: username },
          include: { profile: true },
        });

        if (!user) {
          const uniqueUsername = username.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 10000);
          user = await prisma.user.create({
            data: {
              name: username,
              role: 'USER',
              profile: {
                create: {
                  username: uniqueUsername,
                  displayName: username,
                  level: 1,
                  xp: 0,
                  rating: 1000,
                  coins: 500,
                  gems: 25,
                },
              },
            },
            include: { profile: true },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          level: user.profile?.level ?? 1,
          rating: user.profile?.rating ?? 1000,
          coins: user.profile?.coins ?? 500,
          gems: user.profile?.gems ?? 25,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) return false;

        try {
          // Check if user already exists
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { profile: true },
          });

          if (!existingUser) {
            const baseName = user.name || user.email.split('@')[0] || 'Player';
            const generatedUsername = baseName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(1000 + Math.random() * 9000);

            existingUser = await prisma.user.create({
              data: {
                name: user.name || baseName,
                email: user.email,
                image: user.image,
                role: 'USER',
                profile: {
                  create: {
                    username: generatedUsername,
                    displayName: user.name || baseName,
                    avatarUrl: user.image,
                    level: 1,
                    xp: 0,
                    rating: 1000,
                    coins: 500,
                    gems: 25,
                  },
                },
              },
              include: { profile: true },
            });
          }

          // Link Google account if not linked
          const existingAccount = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
          });

          if (!existingAccount) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              },
            });
          }

          user.id = existingUser.id;
          user.role = existingUser.role;
          user.level = existingUser.profile?.level ?? 1;
          user.rating = existingUser.profile?.rating ?? 1000;
          user.coins = existingUser.profile?.coins ?? 500;
          user.gems = existingUser.profile?.gems ?? 25;
        } catch (error) {
          console.error('Error during Google sign-in:', error);
          // If database is not connected in local dev, allow login to proceed with user info
          user.role = 'USER';
          user.level = 1;
          user.rating = 1000;
          user.coins = 500;
          user.gems = 25;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.level = user.level;
        token.rating = user.rating;
        token.coins = user.coins;
        token.gems = user.gems;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.level = (token.level as number) ?? 1;
        session.user.rating = (token.rating as number) ?? 1000;
        session.user.coins = (token.coins as number) ?? 500;
        session.user.gems = (token.gems as number) ?? 25;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'uno_platform_secret_key_default',
};
