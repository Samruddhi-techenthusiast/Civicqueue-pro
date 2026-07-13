'use strict';
const appointmentRepo = require('../repositories/appointment.repository');
const deptRepo = require('../repositories/department.repository');
const queueService = require('./queue.service');
const notificationService = require('./notification.service');
const { generateSecureToken } = require('../utils/helpers');
const Appointment = require('../models/Appointment.model');
const ApiError = require('../utils/ApiError');

const SLOT_DURATION_MINUTES = 15;

const getAvailableSlots = async (departmentId, date) => {
  const dept = await deptRepo.findById(departmentId);
  if (!dept) throw ApiError.notFound('Department not found');

  const dayName = new Date(date + 'T12:00:00Z')
    .toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const hours = dept.operatingHours?.[dayName];
  if (!hours || hours.isClosed) return [];

  // Generate all slots
  const slots = [];
  const [openH, openM] = hours.open.split(':').map(Number);
  const [closeH, closeM] = hours.close.split(':').map(Number);
  let current = openH * 60 + openM;
  const end = closeH * 60 + closeM;

  while (current + SLOT_DURATION_MINUTES <= end) {
    const startH = String(Math.floor(current / 60)).padStart(2, '0');
    const startMin = String(current % 60).padStart(2, '0');
    current += SLOT_DURATION_MINUTES;
    const endH = String(Math.floor(current / 60)).padStart(2, '0');
    const endMin = String(current % 60).padStart(2, '0');
    slots.push({ start: `${startH}:${startMin}`, end: `${endH}:${endMin}` });
  }

  // Remove booked slots
  const booked = await appointmentRepo.getBookedSlots(departmentId, date);
  const bookedStarts = new Set(booked.map(b => b.timeSlot.start));

  return slots.map(slot => ({ ...slot, available: !bookedStarts.has(slot.start) }));
};

const bookAppointment = async ({ citizenId, departmentId, date, timeSlot, serviceType, notes, priority, bookedBy }) => {
  const dept = await deptRepo.findById(departmentId);
  if (!dept) throw ApiError.notFound('Department not found');

  // Check slot availability
  const slots = await getAvailableSlots(departmentId, date);
  const targetSlot = slots.find(s => s.start === timeSlot.start);
  if (!targetSlot) throw ApiError.badRequest('Invalid time slot');
  if (!targetSlot.available) throw ApiError.conflict('This time slot is already booked');

  const confirmationCode = generateSecureToken(4).toUpperCase();

  const appointment = await appointmentRepo.create({
    citizen: citizenId,
    department: departmentId,
    date,
    timeSlot,
    serviceType: serviceType || 'General',
    notes,
    priority: priority || 'normal',
    confirmationCode,
    bookedBy: bookedBy || citizenId,
  });


  await notificationService.createNotification({
    recipient: citizenId,
    type: 'appointment_confirmed',
    title: 'Appointment Confirmed',
    message: `Your appointment at ${dept.name} on ${date} at ${timeSlot.start} is confirmed. Code: ${confirmationCode}`,
    data: { appointmentId: appointment._id, confirmationCode, date, timeSlot },
    ref: appointment._id,
    refModel: 'Appointment',
  });

  return appointment;
};
// src/services/appointment.service.js — ADD these functions

const approveAppointment = async (appointmentId, staffId) => {
  const appt = await Appointment.findOne({
    _id: appointmentId,
    status: 'pending_approval'  // only approve if pending
  })
  if (!appt) throw ApiError.notFound('Appointment not found or already processed')

  // FIX 9: Verify staff belongs to this department
  const User = require('../models/User.model')
  const staff = await User.findById(staffId).lean()
  if (staff.role === 'staff' &&
      staff.department?.toString() !== appt.department.toString()) {
    throw ApiError.forbidden('Cannot approve appointments for other departments')
  }

  const updated = await Appointment.findByIdAndUpdate(
    appointmentId,
    {
      status: 'scheduled',
      approvedBy: staffId,
      approvedAt: new Date(),
    },
    { new: true }
  )

  // Notify citizen
  await notificationService.createNotification({
    recipient: appt.citizen,
    type: 'appointment_confirmed',
    title: 'Appointment Approved',
    message: `Your appointment on ${appt.date} at ${appt.timeSlot.start} has been approved.`,
    ref: appt._id,
    refModel: 'Appointment',
  })

  return updated
}

const rejectAppointment = async (appointmentId, staffId, rejectReason) => {
  const appt = await Appointment.findOne({
    _id: appointmentId,
    status: { $in: ['pending_approval', 'scheduled'] }
  })
  if (!appt) throw ApiError.notFound('Appointment not found or already processed')

  const User = require('../models/User.model')
  const staff = await User.findById(staffId).lean()
  if (staff.role === 'staff' &&
      staff.department?.toString() !== appt.department.toString()) {
    throw ApiError.forbidden('Cannot reject appointments for other departments')
  }

  const updated = await Appointment.findByIdAndUpdate(
    appointmentId,
    {
      status: 'rejected',
      rejectedBy: staffId,
      rejectedAt: new Date(),
      rejectReason: rejectReason || 'Rejected by staff',
    },
    { new: true }
  )

  await notificationService.createNotification({
    recipient: appt.citizen,
    type: 'appointment_cancelled',
    title: 'Appointment Rejected',
    message: `Your appointment on ${appt.date} at ${appt.timeSlot.start} was rejected. Reason: ${rejectReason || 'No reason provided'}.`,
    ref: appt._id,
    refModel: 'Appointment',
  })

  return updated
}

// FIX 10 — Atomic check-in with lock to prevent double issuance
const checkInAppointment = async (appointmentId, citizenId) => {
  // Atomic: only proceed if status is correct AND lock is false
  // $set checkInLock: true in the same operation
  const appt = await Appointment.findOneAndUpdate(
    {
      _id: appointmentId,
      citizen: citizenId,
      status: { $in: ['scheduled', 'confirmed'] },
      checkInLock: false,   // prevents double check-in
    },
    {
      $set: { checkInLock: true }  // acquire lock atomically
    },
    { new: false }  // return the OLD doc to verify it existed
  )

  if (!appt) {
    // Could be: wrong citizen, wrong status, or already locked (in-progress)
    const existing = await Appointment.findById(appointmentId)
    if (!existing) throw ApiError.notFound('Appointment not found')
    if (existing.citizen.toString() !== citizenId.toString())
      throw ApiError.forbidden('Not your appointment')
    if (existing.checkInLock || existing.status === 'checked_in')
      throw ApiError.conflict('Check-in already in progress or completed')
    throw ApiError.badRequest(`Cannot check in — status is ${existing.status}`)
  }

  const today = new Date().toISOString().slice(0, 10)
  if (appt.date !== today) {
    // Release lock — appointment is not for today
    await Appointment.findByIdAndUpdate(appointmentId, { $set: { checkInLock: false } })
    throw ApiError.badRequest('Appointment is not for today')
  }

  try {
    const { token } = await queueService.issueToken({
      departmentId: appt.department,
      citizen: citizenId,
      serviceType: appt.serviceType,
      priority: appt.priority || 'high',
      priorityReason: 'Pre-booked appointment',
      appointmentRef: appt._id,
    })

    await Appointment.findByIdAndUpdate(appointmentId, {
      status: 'checked_in',
      checkedInAt: new Date(),
      tokenRef: token._id,
      checkInLock: false,  // release lock
    })

    return { appointment: appt, token }
  } catch (err) {
    // If token issuance fails, release lock so citizen can retry
    await Appointment.findByIdAndUpdate(appointmentId, { $set: { checkInLock: false } })
    throw err
  }
}

const cancelAppointment = async (appointmentId, userId, cancelReason) => {
  const appt = await appointmentRepo.findById(appointmentId);
  if (!appt) throw ApiError.notFound('Appointment not found');

  // Only the citizen or staff/admin can cancel
  const UserModel = require('../models/User.model');
  const user = await UserModel.findById(userId).lean();
  const isOwner = appt.citizen.toString() === userId.toString();
  const isStaff = ['staff', 'admin', 'super_admin'].includes(user?.role);

  if (!isOwner && !isStaff) throw ApiError.forbidden('Not authorized to cancel this appointment');
  if (['completed', 'cancelled'].includes(appt.status))
    throw ApiError.badRequest(`Appointment already ${appt.status}`);

  const updated = await appointmentRepo.findByIdAndUpdate(appointmentId, {
    status: 'cancelled',
    cancelledAt: new Date(),
    cancelReason,
  });

  await notificationService.createNotification({
    recipient: appt.citizen,
    type: 'appointment_cancelled',
    title: 'Appointment Cancelled',
    message: `Your appointment on ${appt.date} at ${appt.timeSlot.start} has been cancelled.`,
    data: { appointmentId },
    ref: appointmentId,
    refModel: 'Appointment',
  });

  return updated;
};

module.exports = {
  getAvailableSlots,
  bookAppointment,
  checkInAppointment,
  cancelAppointment,
  approveAppointment,   
  rejectAppointment,    
};
