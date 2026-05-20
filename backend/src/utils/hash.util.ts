import bcrypt from 'bcryptjs';

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);

/**
 * Encrypt passwords using bcryptjs hashing
 * @param password - Plain-text password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
};

/**
 * Compare plain-text passwords with database-saved hashes
 * @param password - Plain-text password
 * @param hash - Hashed password
 */
export const comparePasswords = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
