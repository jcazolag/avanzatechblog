import { User } from "./User.model";

export interface AuthResponse{
    message: string;
    User?: User;
};