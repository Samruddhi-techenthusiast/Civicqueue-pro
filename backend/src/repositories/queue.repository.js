'use strict';
const BaseRepository = require('./base.repository');
const Queue = require('../models/Queue.model');

class QueueRepository extends BaseRepository {
  constructor() { super(Queue); }

  async findTodayByDept(departmentId) {
    const today = new Date().toISOString().slice(0, 10);
    return this.model.findOne({ department: departmentId, date: today })
      .populate('nowServing', 'tokenNumber citizenName status')
      .lean();
  }

  async findOrCreateToday(departmentId, managedBy) {
    const today = new Date().toISOString().slice(0, 10);
    return this.model.findOneAndUpdate(
      { department: departmentId, date: today },
      { $setOnInsert: { department: departmentId, date: today, managedBy, openedAt: new Date() } },
      { upsert: true, new: true, lean: true }
    );
  }

  async incrementSerial(queueId) {
    return this.model.findByIdAndUpdate(
      queueId,
      { $inc: { currentSerial: 1 } },
      { new: true, lean: true }
    );
  }

  // src/repositories/queue.repository.js — REPLACE incrementServed

async incrementServed(queueId, serviceMinutes) {
  // FIX 7: Single pipeline update — atomic read+write
  return this.model.findByIdAndUpdate(
    queueId,
    [{
      $set: {
        totalServed: { $add: ['$totalServed', 1] },
        // Rolling average: (currentAvg * currentCount + newMinutes) / (currentCount + 1)
        avgServiceTimeMinutes: serviceMinutes > 0
          ? {
              $round: [{
                $divide: [
                  {
                    $add: [
                      { $multiply: ['$avgServiceTimeMinutes', '$totalServed'] },
                      serviceMinutes
                    ]
                  },
                  { $add: ['$totalServed', 1] }
                ]
              }, 0]
            }
          : '$avgServiceTimeMinutes'
      }
    }],
    { new: true, lean: true }
  )
}
  async getHistorical(departmentId, fromDate, toDate) {
    return this.find({
      department: departmentId,
      date: { $gte: fromDate, $lte: toDate },
    }, { sort: { date: -1 } });
  }
}

module.exports = new QueueRepository();
