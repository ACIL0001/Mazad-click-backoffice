import User from "./User";

export const enum AttachmentAs {
    PROFILE = 'PROFILE',
    REQUEST = 'REQUEST', 
    MESSAGE = 'MESSAGE',
    SUPPORT = 'SUPPORT',
    NOTE = 'NOTE'
}

export default interface Attachment {
    _id?: string;
    user: User;
    fieldname?: string;
    originalname?: string;
    encoding: string;
    mimetype: string,
    size?: number,
    destination?: string,
    filename?: string,
    path?: string,
    url?: string,
    createdAt: Date,
    as: AttachmentAs
}