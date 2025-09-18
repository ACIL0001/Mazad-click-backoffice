import User from "./User";


export default interface Review {
    _id?: string,
    rating: number;
    user: User;
    createdBy: User;
    comment?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
