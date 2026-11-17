const create = (ns) => {
  const TOKEN = `${ns}_token`;
  const USER = `${ns}_user`;
  return {
    getToken: () => localStorage.getItem(TOKEN),
    getUser: () => {
      try {
        return JSON.parse(localStorage.getItem(USER));
      } catch {
        return null;
      }
    },
    save: (token, user) => {
      localStorage.setItem(TOKEN, token);
      localStorage.setItem(USER, JSON.stringify(user));
    },
    clear: () => {
      localStorage.removeItem(TOKEN);
      localStorage.removeItem(USER);
    },
  };
};

// Patients and admins keep separate sessions.
export const tokenStorage = create("athma");
export const adminTokenStorage = create("athma_admin");
