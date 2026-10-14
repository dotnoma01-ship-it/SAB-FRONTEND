import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiRequest from "../../services/api.js";

export default function ProductsManagement() {
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [deletingId, setDeletingId] = useState("");
const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("all");

const loadProducts = useCallback(async () => {
setLoading(true);
setError("");

try {
  const result = await apiRequest("/products?all=true");
  setProducts(Array.isArray(result?.data) ? result.data : []);
} catch (err) {
  setError(err.message || "Unable to load products.");
} finally {
  setLoading(false);
}


}, []);

useEffect(() => {
loadProducts();
}, [loadProducts]);

async function handleDelete(product) {
const confirmed = window.confirm(
`Are you sure you want to delete "${product.name}"? This action cannot be undone.`
);

if (!confirmed) return;

setDeletingId(product._id);

try {
  await apiRequest(`/products/${product._id}`, {
    method: "DELETE",
  });

  setProducts((current) =>
    current.filter((item) => item._id !== product._id)
  );
} catch (err) {
  window.alert(err.message || "Unable to delete this product.");
} finally {
  setDeletingId("");
}


}

const filteredProducts = products.filter((product) => {
const categoryName =
typeof product.category === "object"
? product.category?.name || ""
: "";


const searchText = [
  product.name,
  product.botanicalName,
  categoryName,
]
  .filter(Boolean)
  .join(" ")
  .toLowerCase();

const matchesSearch = searchText.includes(search.toLowerCase());
const matchesStatus =
  statusFilter === "all" || product.status === statusFilter;

return matchesSearch && matchesStatus;


});

const publishedCount = products.filter(
(product) => product.status === "published"
).length;

const draftCount = products.filter(
(product) => product.status === "draft"
).length;

return ( <section className="management-page"> <div className="management-heading"> <div> <span className="eyebrow">CATALOGUE</span> <h2>Products</h2> <p>Manage the botanical products offered by SAB.</p> </div>


    <Link className="primary-button" to="/admin/products/new">
      + Add Product
    </Link>
  </div>

  <div className="product-summary-grid">
    <article className="product-summary-card">
      <span>Total Products</span>
      <strong>{products.length}</strong>
    </article>

    <article className="product-summary-card">
      <span>Published</span>
      <strong>{publishedCount}</strong>
    </article>

    <article className="product-summary-card">
      <span>Drafts</span>
      <strong>{draftCount}</strong>
    </article>
  </div>

  <div className="product-toolbar">
    <input
      type="search"
      placeholder="Search by product, botanical name, or category..."
      value={search}
      onChange={(event) => setSearch(event.target.value)}
      aria-label="Search products"
    />

    <select
      value={statusFilter}
      onChange={(event) => setStatusFilter(event.target.value)}
      aria-label="Filter products by status"
    >
      <option value="all">All statuses</option>
      <option value="published">Published</option>
      <option value="draft">Draft</option>
      <option value="archived">Archived</option>
    </select>

    <button
      type="button"
      className="secondary-button"
      onClick={loadProducts}
      disabled={loading}
    >
      {loading ? "Loading..." : "Refresh"}
    </button>
  </div>

  {error && (
    <div className="product-error" role="alert">
      <p>{error}</p>
      <button type="button" onClick={loadProducts}>
        Try again
      </button>
    </div>
  )}

  {loading ? (
    <div className="management-empty-state">
      <h3>Loading products...</h3>
      <p>Fetching your product catalogue.</p>
    </div>
  ) : !error && filteredProducts.length === 0 ? (
    <div className="management-empty-state">
      <span className="empty-state-icon">◈</span>
      <h3>{products.length === 0 ? "No products yet" : "No matching products"}</h3>
      <p>
        {products.length === 0
          ? "Add your first botanical product to begin building your catalogue."
          : "Try changing your search or status filter."}
      </p>

      {products.length === 0 && (
        <Link className="primary-button" to="/admin/products/new">
          + Add Your First Product
        </Link>
      )}
    </div>
  ) : !error ? (
    <div className="management-table-wrapper">
      <table className="management-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Status</th>
            <th>Featured</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredProducts.map((product) => {
            const categoryName =
              typeof product.category === "object"
                ? product.category?.name || "Uncategorised"
                : "Uncategorised";

            return (
              <tr key={product._id}>
                <td>
                  <div className="product-name-cell">
                    {product.images?.[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.name}
                      />
                    ) : (
                      <span className="product-thumbnail-placeholder">
                        ◈
                      </span>
                    )}

                    <div>
                      <strong>{product.name}</strong>
                      <small>
                        {product.botanicalName || "No botanical name"}
                      </small>
                    </div>
                  </div>
                </td>

                <td>{categoryName}</td>

                <td>
                  <span
                    className={`product-status status-${product.status}`}
                  >
                    {product.status || "draft"}
                  </span>
                </td>

                <td>{product.isFeatured ? "Yes" : "No"}</td>

                <td>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => handleDelete(product)}
                    disabled={deletingId === product._id}
                  >
                    {deletingId === product._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ) : null}
</section>

);
}
