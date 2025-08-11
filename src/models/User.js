import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true, trim: true },
  last_name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  age: { type: Number, min: 0 },
  password: { type: String, required: true }, // hash
  cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true, versionKey: false });

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = mongoose.model('User', userSchema);