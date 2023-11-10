import express from "express";
import { getClient } from "../db";
import { ObjectId } from "mongodb";
import User from "../model/User";

const usersRouter = express.Router()

export const errorResponse = (error: any, res: any): void => {
    console.log("FAIL", error);
    res.status(500).json({ message: "Internal Server Error" });
  };

//build routes ...


//1. GET /users/:id 
usersRouter.get("/:id", async (req, res) => {
    const userId = req.params.id;
  
    try {
      const client = await getClient();
  
      // Find the user in the "users" collection by ID
      const user = await client
        .db()
        .collection<User>("users")
        .findOne({ _id: new ObjectId(userId) });;
  
      if (user) {
      
        res.status(200).json(user);
      } else {
       
        res.status(404).json("User not found");
      }
    } catch (err) {
    
      errorResponse(err, res);
    }
  });




  //2. POST /users  
  usersRouter.post("/", async (req, res) => {
    const addUser = req.body;

  try {
    const client = await getClient();
    await client.db().collection<User>("users").insertOne(addUser);
    res.status(201).json(addUser);
  } catch (err) {
    errorResponse(err, res);
  }
  });
  

//5 PUT /users/:id 
usersRouter.put("/:id", async (req, res) => {
    // which prod to replace
    const idToReplace: string = req.params.id;
    // what prod to replace it with
    const updatedUser: User = req.body;
    try {
      const client = await getClient();
      const result = await client
        .db()
        .collection<User>("users")
        .replaceOne({ _id: new ObjectId(idToReplace) }, updatedUser);
  
      if (result.matchedCount > 0) {
        res.status(200).json(updatedUser);
      } else {
        res.status(404).json({ message: "user not found" });
      }
    } catch (err) {
      errorResponse(err, res);
    }
  });




//4. DELETE /users/:id 
usersRouter.delete("/:id", async (req, res) => {
    const idToDelete: string = req.params.id;
    try {
      const client = await getClient();
      const result = await client
        .db()
        .collection<User>("users")
        .deleteOne({ _id: new ObjectId(idToDelete) });
      if (result.deletedCount > 0) {
        res.sendStatus(204);
      } else {
        res.status(404).json({ message: "_id not found" });
      }
    } catch (err) {
      errorResponse(err, res);
    }
  });


export default usersRouter