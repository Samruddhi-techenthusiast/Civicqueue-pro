'use strict';
const BaseRepository = require('./base.repository');
const Department = require('../models/Department.model');

class DepartmentRepository extends BaseRepository {
  constructor() { super(Department); }

  async findByCode(code) {
    return this.model.findOne({ code: code.toUpperCase() }).lean();
  }

  async findAllActive(paginationOpts = {}) {
    return this.paginate({ isActive: true }, { ...paginationOpts, sort: { name: 1 } });
  }

  async search(searchTerm, paginationOpts = {}) {
    const filter = searchTerm
      ? { $text: { $search: searchTerm }, isActive: true }
      : { isActive: true };
    return this.paginate(filter, { ...paginationOpts, sort: { name: 1 } });
  }

  async incrementCounter(deptId) {
    return this.model.findByIdAndUpdate(
      deptId,
      { $inc: { activeCounters: 1 } },
      { new: true, lean: true }
    );
  }

  async decrementCounter(deptId) {
    return this.model.findByIdAndUpdate(
      deptId,
      { $inc: { activeCounters: -1 } },
      { new: true, lean: true }
    );
  }
}

module.exports = new DepartmentRepository();
