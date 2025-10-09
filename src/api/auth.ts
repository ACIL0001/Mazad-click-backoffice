import { Credentials } from '../types/Credentials';
import Sms from '../types/Sms';
import User from '../types/User';
import { requests } from './utils';

export const AuthAPI = {
  status: (): Promise<any> => requests.get('auth/status'),
  exists: (tel: string): Promise<any> => requests.get(`auth/exists/${tel}`),
  getSMS: (tel: string): Promise<any> => requests.get(`auth/2factor/send-sms/${tel}`),
  login: (credentials: Credentials): Promise<any> => requests.post('auth/signin', credentials),
  signup: (user: User): Promise<any> => requests.post('auth/signup', user),
  refresh: (refreshToken: string): Promise<any> => requests.put('auth/refresh', { refresh_token: refreshToken }),
  isValid: (sms: Sms): Promise<any> => requests.post('auth/2factor/validate', sms), // {tel, code}
  setPassword: (sms: Sms): Promise<any> => requests.post('auth/2factor/set-password', sms), // {tel, code, password}
};