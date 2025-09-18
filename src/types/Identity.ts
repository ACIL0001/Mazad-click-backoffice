import Attachment from "./Attachment";
import User from "./User";

export enum IdentityType {
  PASSPORT = "PASSPORT",
  DRIVING_LICENCE = "DRIVING_LICENCE",
  NATIONAL_CARD = "NATIONAL_CARD"
}

export enum IdentityStatus {
  PENDING = "PENDING",
  FAILED = "FAILED",
  ACCEPTED = "ACCEPTED"
}

export default interface Identity {
  _id?: string,
  user: User;
  document: Attachment;
  selfie: Attachment;
  status: IdentityStatus,
  type: IdentityType,
  createdAt: Date,
  updatedAt: Date,
}