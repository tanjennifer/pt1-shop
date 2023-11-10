import { ObjectId } from "mongodb";

export default interface User {
    _id?: ObjectId;
displayName: string;
darkTheme: boolean;


}