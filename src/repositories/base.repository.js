export default class BaseRepository {
  constructor(dao) { this.dao = dao; }
  findById(id) { return this.dao.findById(id); }
  create(doc) { return this.dao.create(doc); }
  updateById(id, update) { return this.dao.updateById(id, update); }
}
