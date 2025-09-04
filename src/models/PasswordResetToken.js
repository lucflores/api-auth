import mongoose from "mongoose";
const { Schema, model } = mongoose;

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false }
}, { timestamps: true });

export default model("PasswordResetToken", schema);
