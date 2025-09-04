export default class CartRepository {
  constructor(dao) { this.dao = dao; }

  create(data, opts)             { return this.dao.create(data, opts); }
  getById(id, opts)              { return this.dao.getById(id, opts); }
  save(cart, opts)               { return this.dao.save(cart, opts); }

  addItem(cartId, productId, qty, opts)  { return this.dao.addItem(cartId, productId, qty, opts); }
  setItemQty(cartId, productId, qty, opts){ return this.dao.setItemQty(cartId, productId, qty, opts); }
  removeItem(cartId, productId, opts)    { return this.dao.removeItem(cartId, productId, opts); }
  clear(cartId, opts)             { return this.dao.clear(cartId, opts); }
}
