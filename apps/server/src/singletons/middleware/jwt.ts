import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const jwtSingleton = {
  sign(payload: { sub: string; role: "CLIENT" | "TECH" }) {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: "1h",
    });
  },

  verify(token: string) {
    return jwt.verify(token, JWT_SECRET) as {
      sub: string;
      role: "CLIENT" | "TECH";
      iat: number;
      exp: number;
    };
  },
};
