import mongoose from "mongoose";
import Enquiry from "../models/Enquiry.js";

const validStatuses = ["new", "read", "replied", "archived"];

export async function createEnquiry(req, res, next) {
try {
const { name, email, subject, message } = req.body || {};

if (![name, email, subject, message].every(
  (value) => typeof value === "string" && value.trim()
)) {
  return res.status(400).json({
    success: false,
    message: "Please complete all enquiry fields.",
  });
}

if (
  name.trim().length > 120 ||
  email.trim().length > 254 ||
  subject.trim().length > 180 ||
  message.trim().length > 10000
) {
  return res.status(400).json({
    success: false,
    message: "One or more fields exceed the allowed length.",
  });
}

const enquiry = await Enquiry.create({
  name: name.trim(),
  email: email.trim().toLowerCase(),
  subject: subject.trim(),
  message: message.trim(),
});

return res.status(201).json({
  success: true,
  message: "Your enquiry has been submitted successfully.",
  data: { id: enquiry._id },
});

} catch (error) {
if (error.name === "ValidationError") {
return res.status(400).json({
success: false,
message: "Please provide valid enquiry details.",
});
}

next(error);

}
}

export async function getEnquiries(req, res, next) {
try {
const filter = {};
const { status, search } = req.query;

if (status && status !== "all") {
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid enquiry status.",
    });
  }

  filter.status = status;
}

if (typeof search === "string" && search.trim()) {
  const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const expression = new RegExp(escaped, "i");

  filter.$or = [
    { name: expression },
    { email: expression },
    { subject: expression },
    { message: expression },
  ];
}

const [enquiries, total, newCount, readCount, repliedCount, archivedCount] =
  await Promise.all([
    Enquiry.find(filter).sort({ createdAt: -1 }).lean(),
    Enquiry.countDocuments(),
    Enquiry.countDocuments({ status: "new" }),
    Enquiry.countDocuments({ status: "read" }),
    Enquiry.countDocuments({ status: "replied" }),
    Enquiry.countDocuments({ status: "archived" }),
  ]);

return res.json({
  success: true,
  data: enquiries,
  stats: {
    total,
    new: newCount,
    read: readCount,
    replied: repliedCount,
    archived: archivedCount,
  },
});

} catch (error) {
next(error);
}
}

export async function updateEnquiryStatus(req, res, next) {
try {
const { id } = req.params;
const { status } = req.body || {};

if (!mongoose.isValidObjectId(id)) {
  return res.status(400).json({
    success: false,
    message: "Invalid enquiry ID.",
  });
}

if (!validStatuses.includes(status)) {
  return res.status(400).json({
    success: false,
    message: "Choose a valid enquiry status.",
  });
}

const update = {
  status,
  repliedAt: status === "replied" ? new Date() : null,
  archivedAt: status === "archived" ? new Date() : null,
};

const enquiry = await Enquiry.findByIdAndUpdate(id, update, {
  new: true,
  runValidators: true,
});

if (!enquiry) {
  return res.status(404).json({
    success: false,
    message: "Enquiry not found.",
  });
}

return res.json({
  success: true,
  message: "Enquiry status updated.",
  data: enquiry,
});

} catch (error) {
next(error);
}
}

export async function deleteEnquiry(req, res, next) {
try {
if (!mongoose.isValidObjectId(req.params.id)) {
return res.status(400).json({
success: false,
message: "Invalid enquiry ID.",
});
}

const enquiry = await Enquiry.findByIdAndDelete(req.params.id);

if (!enquiry) {
  return res.status(404).json({
    success: false,
    message: "Enquiry not found.",
  });
}

return res.json({
  success: true,
  message: "Enquiry deleted successfully.",
});

} catch (error) {
next(error);
}
}