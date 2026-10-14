export default function StatCard({ title, value = "—", description, icon }) {
  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <span className="stat-card-title">{title}</span>
        <span className="stat-card-icon">{icon}</span>
      </div>

      <div className="stat-card-value">{value}</div>

      <p className="stat-card-description">
        {description}
      </p>
    </article>
  );
}
