'use strict';
const apptService = require('../services/appointment.service');
const apptRepo = require('../repositories/appointment.repository');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { getPagination } = require('../utils/helpers');
const socketManager = require('../sockets/socket.manager');

const getSlots = catchAsync(async (req, res) => {
  const { departmentId, date } = req.query;
  if (!departmentId || !date) throw ApiError.badRequest('departmentId and date are required');
  const slots = await apptService.getAvailableSlots(departmentId, date);
  ApiResponse.success(res, { date, slots });
});

const book = catchAsync(async (req, res) => {
  const { departmentId, date, timeSlot, serviceType, notes, priority } = req.body;
  const appt = await apptService.bookAppointment({
    citizenId: req.user._id,
    departmentId,
    date,
    timeSlot,
    serviceType,
    notes,
    priority,
    bookedBy: req.user._id,
  });
  ApiResponse.created(res, appt, 'Appointment booked');
});

const getMyAppointments = catchAsync(async (req, res) => {
  const opts = getPagination(req.query);
  const result = await apptRepo.findCitizenAppointments(req.user._id, opts);
  ApiResponse.paginated(res, result.data, result.pagination);
});

const getOne = catchAsync(async (req, res) => {
  const appt = await apptRepo.findById(req.params.id, {
    populate: [
      { path: 'citizen', select: 'name email phone' },
      { path: 'department', select: 'name code location' },
    ],
  });
  if (!appt) throw ApiError.notFound('Appointment not found');
  // Citizen can only see their own
  if (req.user.role === 'citizen' && appt.citizen._id.toString() !== req.user._id.toString())
    throw ApiError.forbidden('Not your appointment');
  ApiResponse.success(res, appt);
});

const checkIn = catchAsync(async (req, res) => {
  const result = await apptService.checkInAppointment(req.params.id, req.user._id);
  ApiResponse.success(res, result, 'Checked in — token issued');
});

const cancel = catchAsync(async (req, res) => {
  const appt = await apptService.cancelAppointment(req.params.id, req.user._id, req.body.cancelReason);
  ApiResponse.success(res, appt, 'Appointment cancelled');
});

// Staff/Admin: get all appointments for a department on a date
const getDeptAppointments = catchAsync(async (req, res) => {
  const opts = getPagination(req.query);
  const result = await apptRepo.findByDeptAndDate(req.params.departmentId, req.query.date, opts);
  ApiResponse.paginated(res, result.data, result.pagination);
});

const approve = catchAsync(async (req, res) => {
  const appt = await apptService.approveAppointment(req.params.id, req.user._id)
  socketManager.emitQueueUpdate(appt.department.toString(), {
    type: 'appointment:approved', appointment: appt
  })
  ApiResponse.success(res, appt, 'Appointment approved')
})

const reject = catchAsync(async (req, res) => {
  const appt = await apptService.rejectAppointment(
    req.params.id, req.user._id, req.body.rejectReason
  )
  ApiResponse.success(res, appt, 'Appointment rejected')
})


// Upload documents for an appointment
const uploadDocuments = catchAsync(async (req, res) => {
  const Appointment = require('../models/Appointment.model');
  const appt = await Appointment.findById(req.params.id);
  if (!appt) throw ApiError.notFound('Appointment not found');
  if (appt.citizen.toString() !== req.user._id.toString())
    throw ApiError.forbidden('Not your appointment');

  const files = req.files || [];
  if (!files.length) throw ApiError.badRequest('No files uploaded');

  const newDocs = files.map(f => ({
    name: f.originalname,
    url: `/uploads/documents/${f.filename}`,
    mimeType: f.mimetype,
    uploadedAt: new Date(),
    status: 'pending',
  }));

  appt.documents.push(...newDocs);
  await appt.save();

  ApiResponse.success(res, { documents: appt.documents }, 'Documents uploaded successfully');
});

// Staff: review a document (approve / reject / request re-upload)
const reviewDocument = catchAsync(async (req, res) => {
  const Appointment = require('../models/Appointment.model');
  const { docIndex } = req.params;
  const { status, remarks } = req.body;

  const validStatuses = ['approved', 'rejected', 're_upload_required'];
  if (!validStatuses.includes(status))
    throw ApiError.badRequest(`status must be one of: ${validStatuses.join(', ')}`);

  const appt = await Appointment.findById(req.params.id);
  if (!appt) throw ApiError.notFound('Appointment not found');
  if (!appt.documents[docIndex]) throw ApiError.notFound('Document not found');

  appt.documents[docIndex].status = status;
  appt.documents[docIndex].remarks = remarks || null;
  appt.documents[docIndex].reviewedBy = req.user._id;
  await appt.save();

  // Notify citizen about document review
  const notificationService = require('../services/notification.service');
  await notificationService.createNotification({
    recipient: appt.citizen,
    type: 'appointment_confirmed',
    title: `Document ${status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Needs Re-upload'}`,
    message: `Your document "${appt.documents[docIndex].name}" was ${status}.${remarks ? ' Note: ' + remarks : ''}`,
    ref: appt._id,
    refModel: 'Appointment',
  });

  ApiResponse.success(res, { document: appt.documents[docIndex] }, 'Document reviewed');
});

module.exports = { getSlots, book, uploadDocuments, reviewDocument, getMyAppointments, getOne, checkIn, cancel,
                   getDeptAppointments, approve, reject };