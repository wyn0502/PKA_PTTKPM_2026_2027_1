// Dung Pham Anh: Băm mật khẩu bcrypt (có salt, NFR-05) và sinh mật khẩu tạm cho tài khoản mới
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

export const hashPassword = (plain) => bcrypt.hash(plain, 10);
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

export function generatePassword() {
  const letters = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const pick = (set) => set[crypto.randomInt(set.length)];
  const chars = [pick(letters), pick(digits)];
  for (let i = 0; i < 8; i += 1) chars.push(pick(letters + digits));
  return chars.sort(() => crypto.randomInt(3) - 1).join('');
}
