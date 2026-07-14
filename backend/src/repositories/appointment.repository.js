'use strict';
const BaseRepository = require('./base.repository');
const Appointment = require('../models/Appointment.model');

class AppointmentRepository extends BaseRepository {
  constructor() { super(Appointment); }

  async findByConfirmationCode(code) {
    return this.model.findOne({ confirmationCode: code })
      .populate('citizen', 'name email phone')
      .populate('department', 'name code')
      .lean();
  }

  async getBookedSlots(departmentId, date) {
    return this.find(
      { department: departmentId, date, status: { $in: ['scheduled', 'confirmed', 'checked_in'] } },
      { select: 'timeSlot', lean: true }
    );
  }

  async findByDeptAndDate(departmentId, date, paginationOpts = {}) {
    return this.paginate(
      { department: departmentId, date, status: { $ne: 'cancelled' } },
      {
        ...paginationOpts,
        sort: { 'timeSlot.start': 1 },
        populate: [{ path: 'citizen', select: 'name email phone' }],
      }
    );
  }

  /**
   * Staff dashboard board — five real buckets in one call, none of them
   * limited to "today only" the way findByDeptAndDate is. This is what
   * fixes appointments booked for a future date never showing up anywhere,
   * and gives the dashboard actual Pending/Today/Upcoming/Completed/Cancelled
   * tabs instead of one day's worth of mixed statuses.
   */
  async findDepartmentBoard(departmentId, { limit = 50 } = {}) {
    const today = new Date().toISOString().slice(0, 10);
    const citizenSelect = { path: 'citizen', select: 'name email phone' };

    const [pending, todayAppts, upcoming, completed, cancelled] = await Promise.all([
      // Pending approval — ANY date, not just today. This is the bucket that was
      // previously invisible for anything not booked for today.
      this.model.find({ department: departmentId, status: 'pending_approval' })
        .sort({ date: 1, 'timeSlot.start': 1 })
        .limit(limit).populate(citizenSelect).lean(),

      // Today, already approved and actionable
      this.model.find({
        department: departmentId, date: today,
        status: { $in: ['scheduled', 'confirmed', 'checked_in'] },
      }).sort({ 'timeSlot.start': 1 }).limit(limit).populate(citizenSelect).lean(),

      // Future dates, already approved
      this.model.find({
        department: departmentId, date: { $gt: today },
        status: { $in: ['scheduled', 'confirmed'] },
      }).sort({ date: 1, 'timeSlot.start': 1 }).limit(limit).populate(citizenSelect).lean(),

      // Recently completed (most recent first)
      this.model.find({ department: departmentId, status: 'completed' })
        .sort({ updatedAt: -1 }).limit(limit).populate(citizenSelect).lean(),

      // Cancelled, rejected, or no-show — grouped together as "did not happen"
      this.model.find({ department: departmentId, status: { $in: ['cancelled', 'rejected', 'no_show'] } })
        .sort({ updatedAt: -1 }).limit(limit).populate(citizenSelect).lean(),
    ]);

    return { pending, today: todayAppts, upcoming, completed, cancelled };
  }

  async findCitizenAppointments(citizenId, paginationOpts = {}) {
    return this.paginate(
      { citizen: citizenId },
      {
        ...paginationOpts,
        sort: { date: -1 },
        populate: [{ path: 'department', select: 'name code location' }],
      }
    );
  }

  async getTodayCheckins(departmentId) {
    const today = new Date().toISOString().slice(0, 10);
    return this.find(
      { department: departmentId, date: today, status: { $in: ['confirmed', 'checked_in'] } },
      { sort: { 'timeSlot.start': 1 }, populate: [{ path: 'citizen', select: 'name phone' }] }
    );
  }

  async getUpcomingReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 10);
    return this.find({ date: dateStr, status: 'scheduled', reminderSent: false });
  }
}

module.exports = new AppointmentRepository();
