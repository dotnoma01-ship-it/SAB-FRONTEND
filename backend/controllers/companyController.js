import CompanyInfo from "../models/CompanyInfo.js";

const editableFields = [
"companyName",
"tagline",
"description",
"email",
"phone",
"whatsapp",
"address",
"website",
];

function validOptionalUrl(value) {
if (!value) return true;

try {
const parsed = new URL(value);
return parsed.protocol === "https:" || parsed.protocol === "http:";
} catch {
return false;
}
}

export async function getCompanyInfo(req, res, next) {
try {
let company = await CompanyInfo.findOne();

if (!company) {
  company = await CompanyInfo.create({});
}

return res.json({
  success: true,
  data: company,
});

} catch (error) {
next(error);
}
}

export async function updateCompanyInfo(req, res, next) {
try {
const body = req.body || {};
const update = {};

for (const field of editableFields) {
  if (body[field] !== undefined) {
    if (typeof body[field] !== "string") {
      return res.status(400).json({
        success: false,
        message: `${field} must be text.`,
      });
    }

    update[field] = body[field].trim();
  }
}

const socialFields = ["facebook", "instagram", "linkedin", "x"];

for (const field of socialFields) {
  const value = body.socialLinks?.[field];

  if (value !== undefined) {
    if (typeof value !== "string" || !validOptionalUrl(value.trim())) {
      return res.status(400).json({
        success: false,
        message: `Enter a valid URL for ${field}.`,
      });
    }

    update[`socialLinks.${field}`] = value.trim();
  }
}

if (update.website && !validOptionalUrl(update.website)) {
  return res.status(400).json({
    success: false,
    message: "Enter a valid website URL beginning with http:// or https://.",
  });
}

if (update.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(update.email)) {
  return res.status(400).json({
    success: false,
    message: "Enter a valid company email address.",
  });
}

if (Object.keys(update).length === 0) {
  return res.status(400).json({
    success: false,
    message: "No editable company information was supplied.",
  });
}

update.updatedBy = req.admin?._id || null;

let company = await CompanyInfo.findOne();

if (!company) {
  company = new CompanyInfo();
}

for (const [field, value] of Object.entries(update)) {
  if (field.startsWith("socialLinks.")) {
    const key = field.split(".")[1];
    company.socialLinks.set
      ? company.socialLinks.set(key, value)
      : (company.socialLinks[key] = value);
  } else {
    company[field] = value;
  }
}

await company.save();

return res.json({
  success: true,
  message: "Company information saved successfully.",
  data: company,
});

} catch (error) {
next(error);
}
}