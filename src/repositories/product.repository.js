export default class ProductRepository {
  constructor(dao) { this.dao = dao; }

  list(filter, opts)        { return this.dao.find(filter, opts); }
  getById(id, opts)         { return this.dao.findById(id, opts); }
  create(input, opts)       { return this.dao.create(input, opts); }
  updateById(id, data, opts){ return this.dao.updateById(id, data, opts); }
  deleteById(id, opts)      { return this.dao.deleteById(id, opts); }
  decrementStock(id, qty, opts) { return this.dao.decrementStock(id, qty, opts); }
}
