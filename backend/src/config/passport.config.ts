import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from 'passport-github2';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import prisma from './database';
import { VerifyCallback } from 'passport-oauth2';
import { Profile as PassportProfile } from 'passport';

passport.serializeUser((user: Express.User, done: (err: Error | null, id?: string) => void) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done: (err: Error | null, user?: Express.User | false) => void) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (user) {
      done(null, user as unknown as Express.User);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error as Error, false);
  }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '',
    scope: ['profile', 'email']
  },
  async (accessToken: string, refreshToken: string, profile: GoogleProfile, done: VerifyCallback) => {
    try {
      let user = await prisma.user.findUnique({ where: { oauthId: profile.id } });

      if (!user) {
        // Create a new tenant for the OAuth user
        const tenant = await prisma.tenant.create({
          data: { companyName: `${profile.displayName}'s Studio` }
        });

        user = await prisma.user.create({
          data: {
            email: profile.emails?.[0]?.value || '',
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
            oauthProvider: 'google',
            oauthId: profile.id,
            role: 'ADMIN',
            tenantId: tenant.id
          }
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      done(null, user as unknown as Express.User);
    } catch (error) {
      done(error as Error, null);
    }
  }
));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    callbackURL: process.env.GITHUB_CALLBACK_URL || '',
    scope: ['user:email']
  },
  async (accessToken: string, refreshToken: string, profile: GitHubProfile, done: VerifyCallback) => {
    try {
      let user = await prisma.user.findUnique({ where: { oauthId: profile.id } });

      if (!user) {
        const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;
        
        // Create a new tenant for the OAuth user
        const tenant = await prisma.tenant.create({
          data: { companyName: `${profile.displayName || profile.username}'s Studio` }
        });

        user = await prisma.user.create({
          data: {
            email,
            name: profile.displayName || profile.username || 'GitHub User',
            avatar: profile.photos?.[0]?.value,
            oauthProvider: 'github',
            oauthId: profile.id,
            role: 'ADMIN',
            tenantId: tenant.id
          }
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      done(null, user as unknown as Express.User);
    } catch (error) {
      done(error as Error, null);
    }
  }
));

passport.use(new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID || '',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
    callbackURL: process.env.MICROSOFT_CALLBACK_URL || '',
    scope: ['user.read']
  },
  async (accessToken: string, refreshToken: string, profile: PassportProfile, done: VerifyCallback) => {
    try {
      let user = await prisma.user.findUnique({ where: { oauthId: profile.id } });

      if (!user) {
        // Create a new tenant for the OAuth user
        const tenant = await prisma.tenant.create({
          data: { companyName: `${profile.displayName}'s Studio` }
        });

        user = await prisma.user.create({
          data: {
            email: profile.emails?.[0]?.value || '',
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
            oauthProvider: 'microsoft',
            oauthId: profile.id,
            role: 'ADMIN',
            tenantId: tenant.id
          }
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      done(null, user as unknown as Express.User);
    } catch (error) {
      done(error as Error, null);
    }
  }
));

export default passport;
