import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'wavi_super_secret_jwt_encryption_key_change_me_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a new JSON Web Token
 * @param payload - Payload containing user identifiers
 */
export const generateToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  });
};

/**
 * Verify a JSON Web Token
 * @param token - Bearer JWT token string
 */
export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};
