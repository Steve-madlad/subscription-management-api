import { UserDocument } from "./models/users.model"; // Adjust path as necessary

declare global {
  namespace Express {
    // Augment the Request interface
    interface Request {
      user?: UserDocument | null; // Use | null since findById can return null
    }
  }
}

// Essential: makes the file a module
export {};