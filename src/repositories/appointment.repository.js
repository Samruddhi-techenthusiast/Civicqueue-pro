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
