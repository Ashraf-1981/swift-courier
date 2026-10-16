import { atomWithStorage } from 'jotai/utils';

// null = nobody logged in
// after login: { accessToken, refreshToken, user: { id, name, role, ... } }
export const authAtom = atomWithStorage('auth', null);