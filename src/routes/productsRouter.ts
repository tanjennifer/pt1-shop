import express from "express";
import { getClient } from "../db";
import Product from "../model/Product";
import { ObjectId } from "mongodb";

const productsRouter = express.Router();

export const errorResponse = (error: any, res: any): void => {
  console.log("FAIL", error);
  res.status(500).json({ message: "Internal Server Error" });
};

//build endpoints
//GET @ "/products"
productsRouter.get("/", async (req, res) => {
  const maxPrice = +(req.query["max-price"] as string);
  const { includes, limit } = req.query;
  const queryObj: any = {};

  if (maxPrice) {
    queryObj.price = { $lte: maxPrice };
  }
  if (includes) {
    queryObj.name = new RegExp(includes as string, "i");
  }
  try {
    //connect to driver -- connect mongo to JS
    const client = await getClient();

    // get all products from mongodb collection; set up mongo command to get it started
    let myMongoCommand = await client
      .db()
      .collection<Product>("products")
      .find(queryObj);

    if (limit) {
      myMongoCommand = myMongoCommand.limit(+(limit as string));
    }

    //call mongo command, store results in allProducts
    //calling it with the toArray()
    const allProducts: Product[] = await myMongoCommand.toArray();
    //send status and json body
    res.status(200).json(allProducts);
  } catch (err) {
    errorResponse(err, res);
  }
});

// GET /products/:id  --- path param, using await(need to include async keyword); try{}catch(){}
productsRouter.get("/:id", async (req, res) => {
  const idImLookingFor: string = req.params.id;
  try {
    const client = await getClient();
    //new makes for the specific type
    const foundProduct: Product | null = await client
      .db()
      .collection<Product>("products")
      .findOne({ _id: new ObjectId(idImLookingFor) });
    if (foundProduct) {
      res.status(200).json(foundProduct);
    } else {
      res.status(404).json({ message: "no prod found" });
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

// try{
//     const client = await getClient()
// }catch(err){
//     errorResponse(err, res)
// }

//POST /products/:id
productsRouter.post("/", async (req, res) => {
  const newProduct: Product = req.body;
  try {
    const client = await getClient();
    await client.db().collection<Product>("products").insertOne(newProduct);
    res.status(201).json(newProduct);
  } catch (err) {
    errorResponse(err, res);
  }
});

//PUT /products/:id
productsRouter.put("/:id", async (req, res) => {
    // which prod to replace
    const idToReplace: string = req.params.id;
    // what prod to replace it with
    const updatedProduct: Product = req.body;
    try {
      const client = await getClient();
      const result = await client
        .db()
        .collection<Product>("products")
        .replaceOne({ _id: new ObjectId(idToReplace) }, updatedProduct);
  
      if (result.matchedCount > 0) {
        res.status(200).json(updatedProduct);
      } else {
        res.status(404).json({ message: "_id not found" });
      }
    } catch (err) {
      errorResponse(err, res);
    }
  });




// DELETE /products/:id
productsRouter.delete("/:id", async (req, res) => {
    const idToDelete: string = req.params.id;
    try {
      const client = await getClient();
      const result = await client
        .db()
        .collection<Product>("products")
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


//**mull */
  //PATCH "/products/:id" --updating doc in a particular way (put is replacing vs patch)
  // PATCH "/products/:id"
productsRouter.patch("/:id/sale", async (req, res) => {
    const idToUpdate: string = req.params.id;
    // what discount
    const discountFromBody: number = req.body.discount; // 25 (this means 25% off)
    try {
      const client = await getClient();
      const result = await client
        .db()
        .collection<Product>("products")
        .updateOne(
          { _id: new ObjectId(idToUpdate) },
          { $mul: { price: (100 - discountFromBody) / 100 } }
        );
      if (result.matchedCount > 0) {
        res.status(200).json({ success: true });
      } else {
        res.status(404).json({ message: "_id not found" });
      }
    } catch (err) {
      errorResponse(err, res);
    }
  });

export default productsRouter;
