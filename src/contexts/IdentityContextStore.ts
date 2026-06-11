import { createContext } from 'react';
import { IdentityDocument } from '@/api/identity';

export interface IIdentityContext {
  identities: IdentityDocument[]
  updateIdentity: () => Promise<void>;
}

export const IdentityContext = createContext<IIdentityContext>({
  identities: [] as IdentityDocument[],
  updateIdentity: async () => {},
});
