import BaseRepository from "./base.repository.js";

export default class UserRepository extends BaseRepository {
  constructor(userDAO) { super(userDAO); }
  findByEmail(email) { return this.dao.findByEmail(email); }
  async updatePassword(userId, passwordHash) {
    return this.dao.updateById(userId, { password: passwordHash });
  }
}
