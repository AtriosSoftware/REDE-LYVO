import { RegisteredAccount, UserProfile, VibeColor } from '../types';
export type { RegisteredAccount };
import { CURRENT_USER } from '../data/mockData';

const STORAGE_USERS_KEY = 'lyvo_registered_users';
const STORAGE_SESSION_KEY = 'lyvo_auth_session';
const STORAGE_CURRENT_USER_KEY = 'lyvo_user';

export const DEFAULT_ACCOUNTS: RegisteredAccount[] = [
  {
    id: 'user_current',
    name: 'Martim Silva',
    username: 'martim_lyvo',
    token: '1234',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Living in Lisboa 🌃 LYVO — Live the moment.',
    vibeColor: 'purple',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'user_ines',
    name: 'Inês Carmo',
    username: 'ines_lx',
    token: '5678',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    bio: 'Vibes do Tejo 🌅 Sem filtros.',
    vibeColor: 'pink',
    createdAt: Date.now() - 86400000,
  }
];

export function getRegisteredAccounts(): RegisteredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    const accounts: RegisteredAccount[] = JSON.parse(raw);
    if (!Array.isArray(accounts) || accounts.length === 0) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    return accounts;
  } catch (e) {
    console.error('Error reading registered accounts', e);
    return DEFAULT_ACCOUNTS;
  }
}

export function isUsernameTaken(username: string): boolean {
  const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
  const accounts = getRegisteredAccounts();
  return accounts.some((acc) => acc.username.toLowerCase() === cleanUsername);
}

export function generate4DigitToken(): string {
  // Generate random 4-digit number from 1000 to 9999
  const num = Math.floor(1000 + Math.random() * 9000);
  return num.toString();
}

export function registerNewUser(params: {
  name: string;
  username: string;
  avatar?: string;
  vibeColor: VibeColor;
  bio?: string;
}): { account: RegisteredAccount; generatedToken: string } {
  const cleanUsername = params.username.trim().toLowerCase().replace(/^@/, '');
  
  if (isUsernameTaken(cleanUsername)) {
    throw new Error(`O nome de utilizador @${cleanUsername} já está registado.`);
  }

  const generatedToken = generate4DigitToken();
  const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const defaultAvatar = params.avatar || `https://images.unsplash.com/photo-${[
    '1534528741775-53994a69daeb',
    '1507003211169-0a1dd7228f2d',
    '1494790108377-be9c29b29330',
    '1500648767791-00dcc994a43e',
    '1524504388940-b1c1722653e1'
  ][Math.floor(Math.random() * 5)]}?auto=format&fit=crop&w=400&q=80`;

  const newAccount: RegisteredAccount = {
    id,
    name: params.name.trim(),
    username: cleanUsername,
    token: generatedToken,
    avatar: defaultAvatar,
    bio: params.bio?.trim() || 'No LYVO para viver o presente. Live the moment.',
    vibeColor: params.vibeColor,
    createdAt: Date.now(),
  };

  const accounts = getRegisteredAccounts();
  accounts.push(newAccount);
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(accounts));

  return { account: newAccount, generatedToken };
}

export function verifyLogin(username: string, token: string): RegisteredAccount | null {
  const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
  const cleanToken = token.trim();

  const accounts = getRegisteredAccounts();
  const found = accounts.find(
    (acc) => acc.username.toLowerCase() === cleanUsername && acc.token === cleanToken
  );

  return found || null;
}

export function accountToUserProfile(account: RegisteredAccount): UserProfile {
  return {
    id: account.id,
    name: account.name,
    username: account.username,
    avatar: account.avatar,
    bio: account.bio,
    vibeColor: account.vibeColor,
    location: 'Lisboa, Portugal',
    activeVibesCount: 1,
    totalVibesShared: 1,
    isOnline: true,
  };
}

export function isSessionActive(): boolean {
  try {
    return localStorage.getItem(STORAGE_SESSION_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

export function setSessionActive(account: RegisteredAccount): void {
  try {
    localStorage.setItem(STORAGE_SESSION_KEY, 'true');
    const profile = accountToUserProfile(account);
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving session', e);
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  } catch (e) {
    console.error('Error clearing session', e);
  }
}
