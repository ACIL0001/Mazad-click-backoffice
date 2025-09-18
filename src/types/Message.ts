import Attachment from "./Attachment";
import Conversation from "./Conversation";
import User from "./User";

export default interface Message {
    _id?: string,
    message: string;
    sender?: User | string;
    conversation: Conversation;
    attachment?: Attachment; 
    hasAttachment?: boolean;
    createdAt: Date;
}

