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
if (!value) return "—";

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
      {loading ? "Refreshing..." : "Refresh"}
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
        <span>🔍</span>
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
        <span className="sab-empty-icon">[ ]</span>
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
            x
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
            Reply by email”
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