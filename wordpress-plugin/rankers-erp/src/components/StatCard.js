export default function StatCard({ title, value, icon, color }) {
    return (
        <div className="rp-stat-card">
            <div className={`rp-stat-icon rp-bg-${color}`}>{icon}</div>
            <div className="rp-stat-info">
                <h3>{title}</h3>
                <p>{value !== undefined ? value : '...'}</p>
            </div>
        </div>
    );
}
