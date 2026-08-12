import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a plaintext password securely.
 */
export const hashPassword = (password: string): string => {
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  return bcrypt.hashSync(password, salt);
};

/**
 * Compare a plaintext password with a hashed password.
 */
export const comparePassword = (password: string, hash: string): boolean => {
  // Fallback for old plaintext passwords in database
  if (!hash.startsWith('$2a$') && !hash.startsWith('$2b$')) {
    return password === hash;
  }
  
  return bcrypt.compareSync(password, hash);
};
