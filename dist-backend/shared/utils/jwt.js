import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const signJwt = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '1d',
    });
};
export const verifyJwt = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch (error) {
        throw new Error('Invalid token');
    }
};
