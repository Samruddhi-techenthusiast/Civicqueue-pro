'use strict';

const BaseRepository = require('./base.repository');
const Token = require('../models/Token.model');

class TokenRepository extends BaseRepository {
  constructor() {
    super(Token);
  }

  /** All waiting tokens for a queue */
  async getWaitingTokens(queueId) {
    return this.find(
      { queue: queueId, status: 'waiting' },
      {},
      { sort: { priorityOrder: -1, serial: 1 } }
    );
  }

  /** Count waiting tokens ahead of a given serial */
  async getPositionInQueue(queueId, serial, priority = 'normal') {
    const priorityOrder = {
      urgent: 3,
      high: 2,
      normal: 1,
    };

    const myPriorityVal = priorityOrder[priority] || 1;

    return this.count({
      queue: queueId,
      status: 'waiting',
      $or: [
        // Higher-priority tokens
        {
          priorityOrder: { $gt: myPriorityVal },
        },

        // Same priority with lower serial
        {
          priorityOrder: myPriorityVal,
          serial: { $lt: serial },
        },
      ],
    });
  }

  async countByStatus(queueId, status) {
    return this.count({
      queue: queueId,
      status,
    });
  }

  async getNextWaiting(queueId) {
    return this.model
      .findOne(
        { queue: queueId, status: 'waiting' },
        null,
        {
          sort: {
            priorityOrder: -1,
            serial: 1,
          },
        }
      )
      .lean();
  }

  async getDailyStats(departmentId, date) {
    return this.aggregate([
      {
        $match: {
          department: departmentId,
          date,
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgWait: {
            $avg: {
              $subtract: ['$servedAt', '$issuedAt'],
            },
          },
        },
      },
    ]);
  }

  async getCitizenHistory(citizenId, paginationOpts = {}) {
    return this.paginate(
      { citizen: citizenId },
      {
        ...paginationOpts,
        sort: { createdAt: -1 },
        populate: [
          {
            path: 'department',
            select: 'name code',
          },
        ],
      }
    );
  }

  async findByTokenNumber(tokenNumber, date) {
    return this.model
      .findOne({ tokenNumber, date })
      .lean();
  }
}

module.exports = new TokenRepository();