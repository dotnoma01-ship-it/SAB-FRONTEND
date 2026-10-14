import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
{
name: {
type: String,
required: [true, "Name is required."],
trim: true,
maxlength: 120,
},
email: {
type: String,
required: [true, "Email is required."],
trim: true,
lowercase: true,
maxlength: 254,
match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address."],
},
subject: {
type: String,
required: [true, "Subject is required."],
trim: true,
maxlength: 180,
},
message: {
type: String,
required: [true, "Message is required."],
trim: true,
maxlength: 10000,
},
status: {
type: String,
enum: ["new", "read", "replied", "archived"],
default: "new",
index: true,
},
repliedAt: {
type: Date,
default: null,
},
archivedAt: {
type: Date,
default: null,
},
},
{ timestamps: true }
);

enquirySchema.index({ createdAt: -1 });

export default mongoose.models.Enquiry ||
mongoose.model("Enquiry", enquirySchema);