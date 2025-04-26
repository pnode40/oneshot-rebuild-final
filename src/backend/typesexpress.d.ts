import { JwtPayload } from '../../shared/types/userTypes';

declare module 'express-serve-static-core' {
  interface Request {
    db: {
      users: {
        findOne: (query: { email: string }) => Promise<any>;
        insertOne: (user: any) => Promise<{ insertedId: string }>;
      };
    };
    user?: JwtPayload; // 👈 THIS IS THE IMPORTANT PART
  }
}
