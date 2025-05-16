import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions, VerifyCallback } from 'passport-jwt';
import { db } from '../db/client';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

// JWT Secret - in production, this should be in an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'oneshot_dev_secret_key';

// JWT payload type
interface JwtPayload {
  userId: number;
  email: string;
  role: 'athlete' | 'recruiter' | 'admin' | 'parent';
}

// Configure JWT strategy options
const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

// Configure the JWT strategy
passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload: JwtPayload, done: VerifyCallback) => {
    try {
      // Find the user by id from the JWT payload
      const userResults = await db.select()
        .from(users)
        .where(eq(users.id, jwtPayload.userId))
        .limit(1);
        
      const user = userResults[0];

      // If user found, return the user object without the password
      if (user) {
        // Use destructuring to remove the hashedPassword field
        const { hashedPassword, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      }
      
      // No user found with the id in the JWT
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport; 