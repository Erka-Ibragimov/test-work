import { sign, verify } from "jsonwebtoken";

type IPayload = {
  id: number;
  email: string;
  name: string;
};

export const generateTokens = (payload: IPayload) => {
  const accessToken = sign(payload, "SECRET", { expiresIn: "2000s" });
  const refreshToken = sign(payload, "SECRET2", { expiresIn: "30d" });
  return {
    accessToken,
    refreshToken,
  };
};
export const validateAccesseToken = (token: string) => {
  try {
    const userData = verify(token, "SECRET");
    return userData;
  } catch (e) {
    return null;
  }
};
export const validateRefreshToken = (token: string) => {
  try {
    const userData = verify(token, "SECRET2");
    return userData;
  } catch (e) {
    return null;
  }
};
