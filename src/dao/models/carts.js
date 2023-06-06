import mongoose from "mongoose";
import db from "../models/db.js";

const collection = "carts";

const schema = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
});

const cartModel = db.model(collection, schema);

export default cartModel;
