'use strict';

/**
 * Generic repository — extend per model.
 * Provides typed CRUD with lean queries and projection support.
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id, options = {}) {
    const q = this.model.findById(id);
    if (options.populate) q.populate(options.populate);
    if (options.select) q.select(options.select);
    if (options.lean !== false) q.lean();
    return q.exec();
  }

  async findOne(filter, options = {}) {
    const q = this.model.findOne(filter);
    if (options.populate) q.populate(options.populate);
    if (options.select) q.select(options.select);
    if (options.lean !== false) q.lean();
    return q.exec();
  }

  async find(filter = {}, options = {}) {
    const q = this.model.find(filter);
    if (options.sort) q.sort(options.sort);
    if (options.skip) q.skip(options.skip);
    if (options.limit) q.limit(options.limit);
    if (options.populate) q.populate(options.populate);
    if (options.select) q.select(options.select);
    if (options.lean !== false) q.lean();
    return q.exec();
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }

  async create(data) {
    const doc = new this.model(data);
    return doc.save();
  }

  async insertMany(docs) {
    return this.model.insertMany(docs, { ordered: false });
  }

  async findByIdAndUpdate(id, update, options = { new: true, runValidators: true }) {
    return this.model.findByIdAndUpdate(id, update, options).lean();
  }

  async findOneAndUpdate(filter, update, options = { new: true, runValidators: true }) {
    return this.model.findOneAndUpdate(filter, update, options).lean();
  }

  async findByIdAndDelete(id) {
    return this.model.findByIdAndDelete(id).lean();
  }

  async deleteMany(filter) {
    return this.model.deleteMany(filter);
  }

  async aggregate(pipeline) {
    return this.model.aggregate(pipeline);
  }

  async paginate(filter, { page = 1, limit = 20, sort = { createdAt: -1 }, populate, select } = {}) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.find(filter, { skip, limit, sort, populate, select }),
      this.count(filter),
    ]);
    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }
}

module.exports = BaseRepository;
