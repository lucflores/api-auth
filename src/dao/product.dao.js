import Product from "../models/Product.js";

export default class ProductDAO {
  async find(filter = {}, { lean = true, session } = {}) {
    let q = Product.find(filter);
    if (session) q = q.session(session);
    if (lean) q = q.lean();
    return q;
  }

  async findById(id, { lean = false, session } = {}) {
    let q = Product.findById(id);
    if (session) q = q.session(session);
    if (lean) q = q.lean();
    return q;
  }

  async create(data, { session } = {}) {
    const doc = new Product(data);
    return session ? doc.save({ session }) : doc.save();
  }

  async updateById(id, data, { session } = {}) {
    return Product.findByIdAndUpdate(id, data, { new: true, session });
  }

  async deleteById(id, { session } = {}) {
    return Product.findByIdAndDelete(id, { session });
  }

  async decrementStock(id, qty, { session } = {}) {
    return Product.findByIdAndUpdate(
      id,
      { $inc: { stock: -Number(qty) } },
      { new: true, session }
    );
  }
}
