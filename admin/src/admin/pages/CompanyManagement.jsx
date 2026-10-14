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