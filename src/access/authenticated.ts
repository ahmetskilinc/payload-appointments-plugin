import type { AccessArgs } from "payload";

import type { User } from "../types";

type isAuthenticated = (args: AccessArgs<User>) => boolean;

export const authenticated: isAuthenticated = ({ req: { user } }) => {
  if (user) {
    return true;
  }
  return false;
};
