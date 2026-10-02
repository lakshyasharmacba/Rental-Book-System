import { useAuthContext } from '../app/providers';

export const useAuth = () => {
  return useAuthContext();
};
