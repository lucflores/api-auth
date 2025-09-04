import Cart from "../models/Cart.js";

export default class CartDAO {
  async create(data = { products: [] }, { session } = {}) {
    const doc = new Cart(data);
    return session ? doc.save({ session }) : doc.save();
  }

  async getById(id, { populate = false, lean = false, session } = {}) {
    let q = Cart.findById(id);
    if (populate) q = q.populate("products.product");
    if (session) q = q.session(session);
    if (lean) q = q.lean();
    return q;
  }

  async save(cart, { session } = {}) {
    return cart.save({ session });
  }

  async addItem(cartId, productId, qty = 1, { session } = {}) {
    const cart = await this.getById(cartId, { session });
    if (!cart) return null;

    const idx = cart.products.findIndex(p => String(p.product) === String(productId));
    if (idx >= 0) cart.products[idx].quantity += Number(qty);
    else cart.products.push({ product: productId, quantity: Number(qty) });

    await cart.save({ session });
    return cart;
  }

  async setItemQty(cartId, productId, qty, { session } = {}) {
    const cart = await this.getById(cartId, { session });
    if (!cart) return null;

    const idx = cart.products.findIndex(p => String(p.product) === String(productId));
    if (idx < 0) return null;

    if (qty <= 0) cart.products.splice(idx, 1);
    else cart.products[idx].quantity = Number(qty);

    await cart.save({ session });
    return cart;
  }

  async removeItem(cartId, productId, { session } = {}) {
    const cart = await this.getById(cartId, { session });
    if (!cart) return null;

    const before = cart.products.length;
    cart.products = cart.products.filter(p => String(p.product) !== String(productId));
    if (cart.products.length === before) return null;

    await cart.save({ session });
    return cart;
  }

  async clear(cartId, { session } = {}) {
    const cart = await this.getById(cartId, { session });
    if (!cart) return null;
    cart.products = [];
    await cart.save({ session });
    return cart;
  }
}
