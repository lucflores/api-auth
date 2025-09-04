import User from "../models/User.js";

export default class UserDAO {
  async findById(id) { return User.findById(id); }
  async findByEmail(email) { return User.findOne({ email }); }
  async create(doc) { return User.create(doc); }
  async updateById(id, update) {
    return User.findByIdAndUpdate(id, update, { new: true });
  }
}
