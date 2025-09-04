import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, default: 1, min: 1 },
});

const cartSchema = new mongoose.Schema(
  {
    products: [itemSchema],
  },
  { timestamps: true, versionKey: false }
);

const Cart = mongoose.model("Cart", cartSchema);
export default Cart; 
