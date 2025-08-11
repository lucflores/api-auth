import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export function hashPassword(plain) {
  return bcrypt.hashSync(plain, SALT_ROUNDS);
}

export function isValidPassword(plain, hashed) {
  return bcrypt.compareSync(plain, hashed);
}