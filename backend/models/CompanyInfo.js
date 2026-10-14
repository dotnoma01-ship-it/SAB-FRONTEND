import mongoose from "mongoose";

const companyInfoSchema = new mongoose.Schema(
{
companyName: {
type: String,
default: "SOUGHT AFTER BOTACEUTICAL",
trim: true,
maxlength: 180,
},
tagline: {
type: String,
default: "",
trim: true,
maxlength: 250,
},
description: {
type: String,
default: "",
trim: true,
maxlength: 10000,
},
email: {
    type: String,
    default: "info@soughtafterbotaceutical.com",
    trim: true,
    lowercase: true,
    maxlength: 254,
},

phone: {
type: String,
default: "",
trim: true,
maxlength: 50,
},
whatsapp: {
type: String,
default: "",
trim: true,
maxlength: 50,
},
address: {
type: String,
default: "",
trim: true,
maxlength: 500,
},
website: {
type: String,
default: "",
trim: true,
maxlength: 500,
},
socialLinks: {
facebook: { type: String, default: "", trim: true, maxlength: 500 },
instagram: { type: String, default: "", trim: true, maxlength: 500 },
linkedin: { type: String, default: "", trim: true, maxlength: 500 },
x: { type: String, default: "", trim: true, maxlength: 500 },
},
updatedBy: {
type: mongoose.Schema.Types.ObjectId,
ref: "Admin",
default: null,
},
},
{ timestamps: true }
);

export default mongoose.models.CompanyInfo ||
mongoose.model("CompanyInfo", companyInfoSchema);