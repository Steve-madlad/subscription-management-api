import { UserDocument } from "./models/users.model";

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument | null;
    }
  }
}

export {};
