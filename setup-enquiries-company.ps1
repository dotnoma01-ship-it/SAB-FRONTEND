$ErrorActionPreference = "Stop"

$ProjectRoot = "C:\Users\USER\OneDrive\Desktop\sought-after-botaceutical"

if (-not (Test-Path $ProjectRoot)) {
throw "SAB project directory was not found: $ProjectRoot"
}

Set-Location $ProjectRoot

$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupRoot = Join-Path $ProjectRoot ".sab-backups$Stamp"

New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null

$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Backup-ProjectFile {
param([string]$RelativePath)

$FullPath = Join-Path $ProjectRoot $RelativePath

if (Test-Path $FullPath) {
    $BackupPath = Join-Path $BackupRoot $RelativePath
    $BackupDirectory = Split-Path $BackupPath -Parent

    New-Item -ItemType Directory -Path $BackupDirectory -Force |
        Out-Null

    Copy-Item $FullPath $BackupPath -Force
}

}

function Write-ProjectFile {
param(
[string]$RelativePath,
[string]$Content
)

$FullPath = Join-Path $ProjectRoot $RelativePath
$Directory = Split-Path $FullPath -Parent

if (-not (Test-Path $Directory)) {
    New-Item -ItemType Directory -Path $Directory -Force |
        Out-Null
}

Backup-ProjectFile $RelativePath

[System.IO.File]::WriteAllText(
    $FullPath,
    $Content,
    $Utf8NoBom
)

Write-Host "Updated: $RelativePath" -ForegroundColor Green

}

Write-Host "`nSAB combined setup starting..." -ForegroundColor Cyan

$RequiredFiles = @(
"backend\server.js",
"backend\middleware\authMiddleware.js",
"admin\src\services\api.js",
"admin\src\admin\pages\EnquiriesManagement.jsx",
"admin\src\admin\pages\CompanyManagement.jsx",
"admin\src\admin\Admin.css",
"frontend\src\pages\Contact.jsx"
)

foreach ($File in $RequiredFiles) {
if (-not (Test-Path (Join-Path $ProjectRoot $File))) {
throw "Required file missing: $File. No setup changes have been made yet."
}
}

# ------------------------------------------------------------

# 1. ENQUIRY MODEL

# ------------------------------------------------------------

Write-ProjectFile "backend\models\Enquiry.js" @'
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
match: [/^[^\s@]+@[^\s@]+.[^\s@]+$/, "Enter a valid email address."],
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
'@

# ------------------------------------------------------------

# 2. COMPANY INFORMATION MODEL

# ------------------------------------------------------------

Write-ProjectFile "backend\models\CompanyInfo.js" @'
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
default: "[info@soughtafterbotaceutical.com](mailto:info@soughtafterbotaceutical.com)",
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
'@

# ------------------------------------------------------------

# 3. ENQUIRY CONTROLLER

# ------------------------------------------------------------

Write-ProjectFile "backend\controllers\enquiryController.js" @'
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
'@

# ------------------------------------------------------------

# 4. COMPANY CONTROLLER

# ------------------------------------------------------------

Write-ProjectFile "backend\controllers\companyController.js" @'
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
'@

# ------------------------------------------------------------

# 5. ENQUIRY ROUTES

# ------------------------------------------------------------

Write-ProjectFile "backend\routes\enquiryRoutes.js" @'
import express from "express";
import {
createEnquiry,
getEnquiries,
updateEnquiryStatus,
deleteEnquiry,
} from "../controllers/enquiryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createEnquiry);
router.get("/", protect, getEnquiries);
router.patch("/:id/status", protect, updateEnquiryStatus);
router.delete("/:id", protect, deleteEnquiry);

export default router;
'@

# ------------------------------------------------------------

# 6. COMPANY ROUTES

# ------------------------------------------------------------

Write-ProjectFile "backend\routes\companyRoutes.js" @'
import express from "express";
import {
getCompanyInfo,
updateCompanyInfo,
} from "../controllers/companyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCompanyInfo);
router.put("/", protect, updateCompanyInfo);

export default router;
'@

# ------------------------------------------------------------

# 7. REGISTER ROUTES IN SERVER

# ------------------------------------------------------------

$ServerPath = Join-Path $ProjectRoot "backend\server.js"
$Server = [System.IO.File]::ReadAllText($ServerPath)
$OriginalServer = $Server

if ($Server -notmatch 'from\s+["'']./routes/enquiryRoutes.js["'']') {
if ($Server -match 'import articleRoutes from "./routes/articleRoutes.js";') {
$Server = $Server.Replace(
'import articleRoutes from "./routes/articleRoutes.js";',
"import articleRoutes from `"./routes/articleRoutes.js`";`r`nimport enquiryRoutes from `"./routes/enquiryRoutes.js`";"
)
} elseif ($Server -match 'import uploadRoutes from "./routes/uploadRoutes.js";') {
$Server = $Server.Replace(
'import uploadRoutes from "./routes/uploadRoutes.js";',
"import uploadRoutes from `"./routes/uploadRoutes.js`";`r`nimport enquiryRoutes from `"./routes/enquiryRoutes.js`";"
)
} else {
throw "Could not find a safe import location for enquiryRoutes in server.js."
}
}

if ($Server -notmatch 'app.use\(["'']/api/enquiries["'']') {
    if ($Server -match 'app\.use\(["'']/api/articles["''],\s*articleRoutes\);') {
$Server = [regex]::Replace(
$Server,
'(app.use\(["'']/api/articles["''],\s*articleRoutes\);)',
'$1' + "`r`napp.use(`"/api/enquiries`", enquiryRoutes);"
)
} elseif ($Server -match 'app.use\(["'']/api/uploads["''],\s*uploadRoutes\);') {
$Server = [regex]::Replace(
$Server,
'(app.use\(["'']/api/uploads["''],\s*uploadRoutes\);)',
'$1' + "`r`napp.use(`"/api/enquiries`", enquiryRoutes);"
)
} else {
throw "Could not find a safe location to register the enquiry route in server.js."
}
}

if ($Server -notmatch 'from\s+["'']./routes/companyRoutes.js["'']') {
if ($Server -match 'import articleRoutes from "./routes/articleRoutes.js";') {
$Server = $Server.Replace(
'import articleRoutes from "./routes/articleRoutes.js";',
"import articleRoutes from `"./routes/articleRoutes.js`";`r`nimport companyRoutes from `"./routes/companyRoutes.js`";"
)
} elseif ($Server -match 'import enquiryRoutes from "./routes/enquiryRoutes.js";') {
$Server = $Server.Replace(
'import enquiryRoutes from "./routes/enquiryRoutes.js";',
"import enquiryRoutes from `"./routes/enquiryRoutes.js`";`r`nimport companyRoutes from `"./routes/companyRoutes.js`";"
)
} else {
throw "Could not find a safe import location for companyRoutes."
}
}

if ($Server -notmatch 'app.use\(["'']/api/company["'']') {
    if ($Server -match 'app\.use\(["'']/api/enquiries["''],\s*enquiryRoutes\);') {
$Server = [regex]::Replace(
$Server,
'(app.use\(["'']/api/enquiries["''],\s*enquiryRoutes\);)',
'$1' + "`r`napp.use(`"/api/company`", companyRoutes);"
)
} else {
throw "Could not find the enquiry mount point for companyRoutes."
}
}

if ($Server -ne $OriginalServer) {
Backup-ProjectFile "backend\server.js"

[System.IO.File]::WriteAllText(
    $ServerPath,
    $Server,
    $Utf8NoBom
)

Write-Host "Registered backend routes." -ForegroundColor Green

} else {
Write-Host "Backend routes already registered." -ForegroundColor Yellow
}

# ------------------------------------------------------------

# 8. ADMIN CUSTOMER ENQUIRIES PAGE

# ------------------------------------------------------------

Write-ProjectFile "admin\src\admin\pages\EnquiriesManagement.jsx" @'
import { useCallback, useEffect, useState } from "react";
import apiRequest from "../../services/api.js";

const emptyStats = {
total: 0,
new: 0,
read: 0,
replied: 0,
archived: 0,
};

const statuses = ["new", "read", "replied", "archived"];

function formatDate(value) {
if (!value) return "â€”";

return new Date(value).toLocaleString(undefined, {
dateStyle: "medium",
timeStyle: "short",
});
}

export default function EnquiriesManagement() {
const [enquiries, setEnquiries] = useState([]);
const [stats, setStats] = useState(emptyStats);
const [status, setStatus] = useState("all");
const [search, setSearch] = useState("");
const [selected, setSelected] = useState(null);
const [loading, setLoading] = useState(true);
const [savingId, setSavingId] = useState("");
const [error, setError] = useState("");
const [notice, setNotice] = useState("");

const loadEnquiries = useCallback(async () => {
setLoading(true);
setError("");

try {
  const params = new URLSearchParams();

  if (status !== "all") params.set("status", status);
  if (search.trim()) params.set("search", search.trim());

  const query = params.toString();
  const result = await apiRequest(
    `/enquiries${query ? `?${query}` : ""}`
  );

  setEnquiries(result.data || []);
  setStats(result.stats || emptyStats);

  if (selected) {
    const refreshed = (result.data || []).find(
      (item) => item._id === selected._id
    );

    if (refreshed) setSelected(refreshed);
  }
} catch (err) {
  setError(err.message || "Unable to load customer enquiries.");
} finally {
  setLoading(false);
}

}, [status, search]);

useEffect(() => {
loadEnquiries();
}, [loadEnquiries]);

async function changeStatus(enquiry, nextStatus) {
setSavingId(enquiry._id);
setError("");
setNotice("");

try {
  const result = await apiRequest(
    `/enquiries/${enquiry._id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status: nextStatus }),
    }
  );

  if (selected?._id === enquiry._id && result.data) {
    setSelected(result.data);
  }

  setNotice("Enquiry status updated.");
  await loadEnquiries();
} catch (err) {
  setError(err.message || "Could not update the enquiry.");
} finally {
  setSavingId("");
}

}

async function deleteEnquiry(enquiry) {
const confirmed = window.confirm(
`Permanently delete the enquiry from ${enquiry.name}?`
);

if (!confirmed) return;

setError("");
setNotice("");

try {
  await apiRequest(`/enquiries/${enquiry._id}`, {
    method: "DELETE",
  });

  if (selected?._id === enquiry._id) setSelected(null);

  setNotice("Enquiry deleted.");
  await loadEnquiries();
} catch (err) {
  setError(err.message || "Could not delete the enquiry.");
}

}

function openEnquiry(enquiry) {
setSelected(enquiry);

if (enquiry.status === "new") {
  changeStatus(enquiry, "read");
}

}

return ( <section className="sab-management-page"> <div className="sab-management-heading"> <div> <span className="sab-eyebrow">CUSTOMER RELATIONSHIPS</span> <h2>Customer Enquiries</h2> <p>Review customer questions and keep track of responses.</p> </div>

    <button
      type="button"
      className="sab-primary-button"
      onClick={loadEnquiries}
      disabled={loading}
    >
      {loading ? "Refreshing..." : "â†» Refresh"}
    </button>
  </div>

  {error && <div className="sab-alert sab-alert-error">{error}</div>}
  {notice && <div className="sab-alert sab-alert-success">{notice}</div>}

  <div className="sab-stats-grid">
    {[
      ["Total enquiries", stats.total],
      ["New", stats.new],
      ["Read", stats.read],
      ["Replied", stats.replied],
      ["Archived", stats.archived],
    ].map(([label, value]) => (
      <article className="sab-stat-card" key={label}>
        <span>{label}</span>
        <strong>{value}</strong>
      </article>
    ))}
  </div>

  <div className="sab-management-panel">
    <div className="sab-toolbar">
      <label className="sab-search-field">
        <span>âŒ•</span>
        <input
          type="search"
          placeholder="Search name, email, subject or message..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>

      <select
        aria-label="Filter enquiries by status"
        value={status}
        onChange={(event) => setStatus(event.target.value)}
      >
        <option value="all">All statuses</option>
        {statuses.map((item) => (
          <option key={item} value={item}>
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </option>
        ))}
      </select>
    </div>

    {loading ? (
      <div className="sab-empty-state">Loading enquiries...</div>
    ) : enquiries.length === 0 ? (
      <div className="sab-empty-state">
        <span className="sab-empty-icon">âœ‰</span>
        <h3>No enquiries found</h3>
        <p>
          New messages submitted through the public contact form will
          appear here.
        </p>
      </div>
    ) : (
      <div className="sab-table-wrap">
        <table className="sab-data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Subject</th>
              <th>Date received</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {enquiries.map((enquiry) => (
              <tr key={enquiry._id}>
                <td>
                  <strong>{enquiry.name}</strong>
                  <span className="sab-table-secondary">
                    {enquiry.email}
                  </span>
                </td>

                <td className="sab-subject-cell">{enquiry.subject}</td>

                <td>{formatDate(enquiry.createdAt)}</td>

                <td>
                  <span
                    className={`sab-status-badge status-${enquiry.status}`}
                  >
                    {enquiry.status}
                  </span>
                </td>

                <td>
                  <div className="sab-row-actions">
                    <button
                      type="button"
                      className="sab-small-button"
                      onClick={() => openEnquiry(enquiry)}
                    >
                      View
                    </button>

                    <button
                      type="button"
                      className="sab-small-button"
                      onClick={() => deleteEnquiry(enquiry)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>

  {selected && (
    <div
      className="sab-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setSelected(null);
      }}
    >
      <section
        className="sab-message-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sab-enquiry-title"
      >
        <div className="sab-modal-heading">
          <div>
            <span className="sab-eyebrow">CUSTOMER MESSAGE</span>
            <h3 id="sab-enquiry-title">{selected.subject}</h3>
          </div>

          <button
            type="button"
            className="sab-close-button"
            aria-label="Close message"
            onClick={() => setSelected(null)}
          >
            Ã—
          </button>
        </div>

        <div className="sab-message-meta">
          <p><strong>From:</strong> {selected.name}</p>
          <p><strong>Email:</strong> {selected.email}</p>
          <p><strong>Received:</strong> {formatDate(selected.createdAt)}</p>
        </div>

        <div className="sab-message-body">{selected.message}</div>

        <div className="sab-form-field">
          <label htmlFor="sab-enquiry-status">Enquiry status</label>
          <select
            id="sab-enquiry-status"
            value={selected.status}
            disabled={savingId === selected._id}
            onChange={(event) =>
              changeStatus(selected, event.target.value)
            }
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="sab-modal-actions">
          <a
            className="sab-primary-button"
            href={`mailto:${encodeURIComponent(selected.email)}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}
          >
            Reply by email â†—
          </a>

          <button
            type="button"
            className="sab-secondary-button"
            onClick={() => setSelected(null)}
          >
            Close
          </button>
        </div>

        <p className="sab-form-help">
          Reply by email opens your email application. It does not send
          the reply automatically.
        </p>
      </section>
    </div>
  )}
</section>

);
}
'@

# ------------------------------------------------------------

# 9. ADMIN COMPANY INFORMATION PAGE

# ------------------------------------------------------------

Write-ProjectFile "admin\src\admin\pages\CompanyManagement.jsx" @'
import { useEffect, useState } from "react";
import apiRequest from "../../services/api.js";

const initialCompany = {
companyName: "",
tagline: "",
description: "",
email: "",
phone: "",
whatsapp: "",
address: "",
website: "",
socialLinks: {
facebook: "",
instagram: "",
linkedin: "",
x: "",
},
};

const fields = [
{ name: "companyName", label: "Company name", required: true },
{ name: "tagline", label: "Tagline" },
{ name: "email", label: "Company email", type: "email" },
{ name: "phone", label: "Phone number" },
{ name: "whatsapp", label: "WhatsApp number" },
{ name: "website", label: "Website URL", type: "url" },
];

export default function CompanyManagement() {
const [company, setCompany] = useState(initialCompany);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");
const [notice, setNotice] = useState("");

useEffect(() => {
let active = true;

async function loadCompany() {
  try {
    const result = await apiRequest("/company");

    if (active && result.data) {
      setCompany({
        ...initialCompany,
        ...result.data,
        socialLinks: {
          ...initialCompany.socialLinks,
          ...(result.data.socialLinks || {}),
        },
      });
    }
  } catch (err) {
    if (active) {
      setError(err.message || "Unable to load company information.");
    }
  } finally {
    if (active) setLoading(false);
  }
}

loadCompany();

return () => {
  active = false;
};

}, []);

function updateField(event) {
const { name, value } = event.target;

setCompany((current) => ({
  ...current,
  [name]: value,
}));

}

function updateSocial(event) {
const { name, value } = event.target;

setCompany((current) => ({
  ...current,
  socialLinks: {
    ...current.socialLinks,
    [name]: value,
  },
}));

}

async function handleSubmit(event) {
event.preventDefault();
setSaving(true);
setError("");
setNotice("");

try {
  const result = await apiRequest("/company", {
    method: "PUT",
    body: JSON.stringify(company),
  });

  if (result.data) {
    setCompany({
      ...initialCompany,
      ...result.data,
      socialLinks: {
        ...initialCompany.socialLinks,
        ...(result.data.socialLinks || {}),
      },
    });
  }

  setNotice(result.message || "Company information saved successfully.");
} catch (err) {
  setError(err.message || "Unable to save company information.");
} finally {
  setSaving(false);
}

}

if (loading) {
return ( <section className="sab-management-page"> <div className="sab-empty-state">Loading company information...</div> </section>
);
}

return ( <section className="sab-management-page"> <div className="sab-management-heading"> <div> <span className="sab-eyebrow">BUSINESS SETTINGS</span> <h2>Company Information</h2> <p>Maintain SAB's official company details and contact information.</p> </div>

    <span className="sab-settings-indicator">Company profile</span>
  </div>

  {error && <div className="sab-alert sab-alert-error">{error}</div>}
  {notice && <div className="sab-alert sab-alert-success">{notice}</div>}

  <form className="sab-company-form" onSubmit={handleSubmit}>
    <section className="sab-management-panel">
      <div className="sab-panel-heading">
        <h3>Company profile</h3>
        <p>Basic information about your business.</p>
      </div>

      <div className="sab-form-grid">
        {fields.map((field) => (
          <div className="sab-form-field" key={field.name}>
            <label htmlFor={field.name}>{field.label}</label>
            <input
              id={field.name}
              name={field.name}
              type={field.type || "text"}
              value={company[field.name] || ""}
              onChange={updateField}
              required={field.required}
              maxLength={field.name === "description" ? 10000 : 500}
            />
          </div>
        ))}

        <div className="sab-form-field sab-field-full">
          <label htmlFor="description">Company description</label>
          <textarea
            id="description"
            name="description"
            rows={6}
            maxLength={10000}
            value={company.description || ""}
            onChange={updateField}
            placeholder="Describe SAB, its products, and its mission..."
          />
        </div>

        <div className="sab-form-field sab-field-full">
          <label htmlFor="address">Business address</label>
          <textarea
            id="address"
            name="address"
            rows={3}
            maxLength={500}
            value={company.address || ""}
            onChange={updateField}
            placeholder="Enter the official business address..."
          />
        </div>
      </div>
    </section>

    <section className="sab-management-panel">
      <div className="sab-panel-heading">
        <h3>Social media</h3>
        <p>Use complete profile URLs beginning with https://.</p>
      </div>

      <div className="sab-form-grid">
        {[
          ["facebook", "Facebook"],
          ["instagram", "Instagram"],
          ["linkedin", "LinkedIn"],
          ["x", "X"],
        ].map(([name, label]) => (
          <div className="sab-form-field" key={name}>
            <label htmlFor={`social-${name}`}>{label} URL</label>
            <input
              id={`social-${name}`}
              name={name}
              type="url"
              value={company.socialLinks?.[name] || ""}
              onChange={updateSocial}
              placeholder="https://..."
            />
          </div>
        ))}
      </div>
    </section>

    <div className="sab-company-save-row">
      <p className="sab-form-help">
        Changes are saved to the database when you select Save changes.
      </p>

      <button
        type="submit"
        className="sab-primary-button"
        disabled={saving}
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
    </div>
  </form>
</section>

);
}
'@

# ------------------------------------------------------------

# 10. ADMIN CSS

# ------------------------------------------------------------

$CssPath = Join-Path $ProjectRoot "admin\src\admin\Admin.css"
$Css = [System.IO.File]::ReadAllText($CssPath)

if ($Css -notmatch 'SAB ENQUIRIES AND COMPANY MANAGEMENT') {
$AdditionalCss = @'

/* SAB ENQUIRIES AND COMPANY MANAGEMENT */
.sab-management-page {
width: 100%;
min-width: 0;
color: var(--text-primary, #17251f);
}

.sab-management-heading {
display: flex;
align-items: center;
justify-content: space-between;
gap: 20px;
margin-bottom: 24px;
}

.sab-management-heading h2 {
margin: 7px 0;
font-size: clamp(24px, 3vw, 32px);
}

.sab-management-heading p,
.sab-panel-heading p {
margin: 6px 0 0;
color: var(--text-secondary, #68756e);
line-height: 1.6;
}

.sab-eyebrow {
color: #167653;
font-size: 11px;
font-weight: 800;
letter-spacing: 1.5px;
}

.sab-primary-button,
.sab-secondary-button,
.sab-small-button {
display: inline-flex;
align-items: center;
justify-content: center;
gap: 8px;
border-radius: 9px;
padding: 11px 16px;
font: inherit;
font-size: 13px;
font-weight: 700;
text-decoration: none;
cursor: pointer;
transition: background .2s ease, opacity .2s ease;
}

.sab-primary-button {
border: 1px solid #126e51;
background: #126e51;
color: #fff;
}

.sab-primary-button:hover {
background: #0c523c;
}

.sab-secondary-button {
border: 1px solid #d8e1db;
background: #fff;
color: #263a30;
}

.sab-small-button {
border: 1px solid #d8e1db;
background: #fff;
color: #245540;
padding: 7px 10px;
}

.sab-primary-button:disabled,
.sab-secondary-button:disabled,
.sab-small-button:disabled {
cursor: not-allowed;
opacity: .6;
}

.sab-stats-grid {
display: grid;
grid-template-columns: repeat(5, minmax(0, 1fr));
gap: 14px;
margin-bottom: 22px;
}

.sab-stat-card {
padding: 19px;
border: 1px solid #e7ede9;
border-radius: 14px;
background: #fff;
box-shadow: 0 4px 16px rgba(20, 60, 40, .035);
}

.sab-stat-card span {
display: block;
color: #68756e;
font-size: 12px;
}

.sab-stat-card strong {
display: block;
margin-top: 12px;
color: #126e51;
font-size: 28px;
}

.sab-management-panel {
margin-bottom: 22px;
padding: 22px;
border: 1px solid #e7ede9;
border-radius: 14px;
background: #fff;
box-shadow: 0 4px 16px rgba(20, 60, 40, .035);
}

.sab-toolbar {
display: flex;
align-items: center;
gap: 12px;
margin-bottom: 20px;
}

.sab-search-field {
display: flex;
align-items: center;
flex: 1;
gap: 10px;
min-width: 0;
padding: 0 13px;
border: 1px solid #dfe7e1;
border-radius: 9px;
}

.sab-search-field > span {
font-size: 22px;
color: #728077;
}

.sab-search-field input {
width: 100%;
min-width: 0;
padding: 12px 0;
border: 0;
outline: 0;
background: transparent;
color: inherit;
font: inherit;
}

.sab-toolbar select,
.sab-form-field input,
.sab-form-field textarea,
.sab-form-field select {
width: 100%;
min-width: 0;
border: 1px solid #dfe7e1;
border-radius: 9px;
padding: 11px 12px;
background: #fff;
color: #24382d;
font: inherit;
font-size: 13px;
}

.sab-toolbar select {
width: auto;
min-width: 150px;
}

.sab-data-table {
width: 100%;
border-collapse: collapse;
text-align: left;
font-size: 13px;
}

.sab-data-table th {
padding: 13px 12px;
background: #f5f8f5;
color: #617067;
font-size: 11px;
font-weight: 800;
text-transform: uppercase;
letter-spacing: .5px;
}

.sab-data-table td {
padding: 15px 12px;
border-bottom: 1px solid #edf1ee;
vertical-align: middle;
}

.sab-data-table td strong,
.sab-table-secondary {
display: block;
}

.sab-table-secondary {
margin-top: 5px;
color: #738077;
font-size: 12px;
overflow-wrap: anywhere;
}

.sab-subject-cell {
max-width: 250px;
overflow-wrap: anywhere;
}

.sab-row-actions {
display: flex;
flex-wrap: wrap;
gap: 6px;
}

.sab-status-badge {
display: inline-flex;
border-radius: 30px;
padding: 6px 10px;
background: #eef2ef;
color: #536259;
font-size: 11px;
font-weight: 800;
text-transform: capitalize;
}

.sab-status-badge.status-new {
background: #fff2d7;
color: #925d00;
}

.sab-status-badge.status-read {
background: #e6f0ff;
color: #245a99;
}

.sab-status-badge.status-replied {
background: #e0f5e8;
color: #176a40;
}

.sab-status-badge.status-archived {
background: #f0ebf5;
color: #6e4a8b;
}

.sab-empty-state {
padding: 45px 20px;
text-align: center;
color: #718077;
line-height: 1.7;
}

.sab-empty-state h3 {
margin: 12px 0 5px;
color: #263a30;
}

.sab-empty-icon {
font-size: 30px;
}

.sab-alert {
margin-bottom: 18px;
padding: 13px 15px;
border: 1px solid transparent;
border-radius: 9px;
font-size: 13px;
line-height: 1.6;
}

.sab-alert-error {
border-color: #f0c9c9;
background: #fff0f0;
color: #a52b2b;
}

.sab-alert-success {
border-color: #c8e7d3;
background: #effaf3;
color: #176a40;
}

.sab-modal-backdrop {
position: fixed;
inset: 0;
z-index: 1000;
display: flex;
align-items: center;
justify-content: center;
overflow-y: auto;
padding: 22px;
background: rgba(13, 27, 20, .55);
}

.sab-message-modal {
width: min(650px, 100%);
max-height: calc(100vh - 44px);
overflow-y: auto;
padding: 25px;
border-radius: 16px;
background: #fff;
box-shadow: 0 20px 70px rgba(0, 0, 0, .2);
}

.sab-modal-heading {
display: flex;
align-items: flex-start;
justify-content: space-between;
gap: 18px;
}

.sab-modal-heading h3 {
margin: 8px 0 0;
overflow-wrap: anywhere;
}

.sab-close-button {
width: 36px;
height: 36px;
border: 1px solid #dfe7e1;
border-radius: 50%;
background: #fff;
color: #24382d;
font-size: 25px;
cursor: pointer;
}

.sab-message-meta {
margin: 20px 0;
padding: 15px;
border-radius: 10px;
background: #f5f8f5;
overflow-wrap: anywhere;
}

.sab-message-meta p {
margin: 6px 0;
font-size: 13px;
}

.sab-message-body {
padding: 18px 0;
line-height: 1.8;
white-space: pre-wrap;
overflow-wrap: anywhere;
}

.sab-form-field {
display: flex;
flex-direction: column;
gap: 8px;
margin-bottom: 17px;
}

.sab-form-field label {
color: #364b3e;
font-size: 12px;
font-weight: 800;
}

.sab-modal-actions {
display: flex;
flex-wrap: wrap;
gap: 10px;
margin-top: 20px;
}

.sab-form-help {
color: #758078;
font-size: 12px;
line-height: 1.7;
}

.sab-modal-actions + .sab-form-help {
margin-top: 14px;
}

.sab-settings-indicator {
padding: 9px 13px;
border: 1px solid #d5e9dc;
border-radius: 30px;
background: #eff8f2;
color: #176a40;
font-size: 12px;
font-weight: 700;
}

.sab-company-form {
max-width: 100%;
}

.sab-panel-heading {
margin-bottom: 22px;
}

.sab-panel-heading h3 {
margin: 0;
font-size: 17px;
}

.sab-form-grid {
display: grid;
grid-template-columns: repeat(2, minmax(0, 1fr));
gap: 18px;
}

.sab-field-full {
grid-column: 1 / -1;
}

.sab-form-field textarea {
resize: vertical;
line-height: 1.6;
}

.sab-company-save-row {
display: flex;
align-items: center;
justify-content: space-between;
flex-wrap: wrap;
gap: 15px;
margin: 20px 0 30px;
}

.sab-company-save-row .sab-form-help {
margin: 0;
}

@media (max-width: 1000px) {
.sab-stats-grid {
grid-template-columns: repeat(3, minmax(0, 1fr));
}

.sab-table-wrap {
overflow-x: auto;
}

.sab-data-table {
min-width: 750px;
}
}

@media (max-width: 600px) {
.sab-management-heading {
align-items: flex-start;
flex-direction: column;
}

.sab-stats-grid {
grid-template-columns: repeat(2, minmax(0, 1fr));
gap: 10px;
}

.sab-stat-card {
padding: 14px;
}

.sab-stat-card strong {
font-size: 24px;
}

.sab-management-panel {
padding: 15px;
}

.sab-toolbar,
.sab-company-save-row {
align-items: stretch;
flex-direction: column;
}

.sab-toolbar select {
width: 100%;
}

.sab-form-grid {
grid-template-columns: 1fr;
}

.sab-field-full {
grid-column: auto;
}

.sab-message-modal {
padding: 18px;
}
}
'@

Backup-ProjectFile "admin\src\admin\Admin.css"

[System.IO.File]::WriteAllText(
    $CssPath,
    $Css + $AdditionalCss,
    $Utf8NoBom
)

Write-Host "Added enquiry and company styles." -ForegroundColor Green

} else {
Write-Host "Management styles already present." -ForegroundColor Yellow
}

# ------------------------------------------------------------

# 11. CONNECT THE PUBLIC CONTACT FORM TO THE API

# ------------------------------------------------------------

$ContactPath = Join-Path $ProjectRoot "frontend\src\pages\Contact.jsx"
$Contact = [System.IO.File]::ReadAllText($ContactPath)
$OriginalContact = $Contact

if ($Contact -notmatch 'VITE_API_URL') {
$Contact = [regex]::Replace(
$Contact,
'import\s+{\s*useState\s*}\s+from\s+["'']react["''];',
'import { useState } from "react";' + "`r`nconst API_BASE_URL = (import.meta.env.VITE_API_URL || `"http://localhost:5002/api`").replace(//$/, `"`");",
1
)
}

if ($Contact -match 'const \(submitted, setSubmitted\) = useState\(false\);') {
$Contact = $Contact.Replace(
'const [submitted, setSubmitted] = useState(false);',
"const [submitted, setSubmitted] = useState(false);`r`n    const [sending, setSending] = useState(false);`r`n    const [submitError, setSubmitError] = useState(`"`");"
)
}

$Contact = $Contact.Replace(
'setSubmitted(false);',
"setSubmitted(false);`r`n        setSubmitError(`"`");"
)

$NewSubmitHandler = @'
async function handleSubmit(event) {
event.preventDefault();
setSending(true);
setSubmitError("");
setSubmitted(false);

    try {
        const response = await fetch(`${API_BASE_URL}/enquiries`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                result.message || "Unable to submit your enquiry. Please try again."
            );
        }

        setSubmitted(true);
        setFormData({
            name: "",
            email: "",
            subject: "",
            message: "",
        });
    } catch (error) {
        setSubmitError(
            error.message || "Unable to submit your enquiry. Please try again."
        );
    } finally {
        setSending(false);
    }
}

return (

'@

$HandlerPattern = 'function handleSubmit\(event\)\s*{.*?\r?\n\s*}\s*\r?\n\s*return\s*('

if ($Contact -match $HandlerPattern) {
$Contact = [regex]::Replace(
$Contact,
$HandlerPattern,
[System.Text.RegularExpressions.MatchEvaluator]{
param($Match)
return $NewSubmitHandler
},
[System.Text.RegularExpressions.RegexOptions]::Singleline,
[TimeSpan]::FromSeconds(5)
)
} else {
Write-Host "WARNING: Could not safely locate Contact.jsx submit handler." -ForegroundColor Yellow
Write-Host "The backend and admin pages will still be installed. Contact.jsx remains unchanged except for safe state edits." -ForegroundColor Yellow
}

$Contact = $Contact.Replace(
"Prepare EmailEnquiry",
'{sending ? "Sending Enquiry..." : "Send Enquiry"}'
)

$Contact = [regex]::Replace(
$Contact,
'(<button(?=[^>]*className=["'']sa-contact-submit["''])(?=[^>]*type=["'']submit["''])[^>]*)(>)',
'$1 disabled={sending}$2',
1
)

if ($Contact -match '</form>') {
if ($Contact -notmatch 'submitError &&') {
$Contact = [regex]::Replace(
$Contact,
'</form>',
'<p className="sa-contact-status" role="alert">{submitError && submitError}</p>' + "`r`n</form>",
1
)
}
}

$Contact = [regex]::Replace(
$Contact,
'email draft opened',
'Your enquiry has been sent successfully.',
[System.Text.RegularExpressions.RegexOptions]::IgnoreCase
)

if ($Contact -ne $OriginalContact) {
Backup-ProjectFile "frontend\src\pages\Contact.jsx"

[System.IO.File]::WriteAllText(
    $ContactPath,
    $Contact,
    $Utf8NoBom
)

Write-Host "Updated public Contact.jsx." -ForegroundColor Green

} else {
Write-Host "Contact.jsx did not require modification." -ForegroundColor Yellow
}

# ------------------------------------------------------------

# 12. FINISH

# ------------------------------------------------------------

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SAB COMBINED SETUP FINISHED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nBackup directory:" -ForegroundColor Yellow
Write-Host $BackupRoot

Write-Host "`nUpdated functionality:" -ForegroundColor Yellow
Write-Host " - Customer enquiry database model and API"
Write-Host " - Protected admin enquiry management"
Write-Host " - Company information database and API"
Write-Host " - Admin company information editor"
Write-Host " - Admin CSS for the new pages"
Write-Host " - Public contact form API connection"
