import Message from "./Message";
import User from "./User";

export default interface Conversation {
    _id: string,
    name: string;
    isGroup: boolean;
    members: User[];
    ended?: boolean;
    messages?: Message[];
    createdAt?: Date;
    createdBy: User;
    updatedAt?: Date;
}