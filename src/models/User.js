import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true, trim: true },
  last_name:  { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, index: true, trim: true },
  age:        { type: Number, min: 0 },
  password:   { type: String, required: true, select: false }, 
  cart:       { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
  role:       { type: String, enum: ['user', 'admin'], default: 'user' },
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      delete ret.password;             
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});


const User = mongoose.model('User', userSchema);
export default User;
