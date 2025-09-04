import mongoose from "mongoose";

const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price:       { type: Number, required: true, min: 0 },
    stock:       { type: Number, required: true, min: 0 },
    category:    { type: String, trim: true },
    status:      { type: Boolean, default: true },   
    thumbnails:  { type: [String], default: [] },  
  },
  { timestamps: true, versionKey: false }
);


const Product = model("Product", productSchema);
export default Product;
