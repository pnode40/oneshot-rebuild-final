import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/userTypes.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const signJwt = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1d',
  });
};

export const verifyJwt = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}; 