import { useState, useEffect } from '@wordpress/element';
import { api } from '../api/client';
import StatCard from '../components/StatCard';

export default function Dashboard({ user }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/reports/dashboard').then(r => setStats(r.data)).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="rp-loading"><div className="rp-spinner"/></div>;

    return (
        <div className="rp-page">
            <div className="rp-page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome back, {user?.name}! Here's an overview.</p>
                </div>
            </div>
            <div className="rp-stats-grid">
                <StatCard title="Total Students"    value={stats?.totalStudents}    icon="👨‍🎓" color="blue"   />
                <StatCard title="Pending Approval"  value={stats?.pendingStudents}  icon="⏳"    color="amber"  />
                <StatCard title="Fee Collected"     value={`₹${(stats?.totalCollected||0).toLocaleString('en-IN')}`} icon="💰" color="green" />
                <StatCard title="Outstanding Dues"  value={`₹${(stats?.totalDues||0).toLocaleString('en-IN')}`}     icon="📋" color="red"   />
                <StatCard title="Total Expenses"    value={`₹${(stats?.totalExpenses||0).toLocaleString('en-IN')}`} icon="💸" color="purple"/>
                <StatCard title="Staff Members"     value={stats?.totalStaff}       icon="👨‍💼" color="indigo" />
                <StatCard title="Hostel Students"   value={stats?.hostelStudents}   icon="🏠"   color="teal"   />
                <StatCard title="Net Revenue"       value={`₹${((stats?.totalCollected||0)-(stats?.totalExpenses||0)).toLocaleString('en-IN')}`} icon="📈" color="green"/>
            </div>

            <div className="rp-grid-2">
                <div className="rp-card">
                    <div className="rp-card-header"><h2>Recent Payments</h2></div>
                    <div className="rp-table-wrap">
                        <table className="rp-table">
                            <thead><tr><th>Student</th><th>Reg No</th><th>Amount</th><th>Mode</th><th>Date</th></tr></thead>
                            <tbody>
                                {(stats?.recentPayments||[]).map(p => (
                                    <tr key={p.id}>
                                        <td>{p.student_name}</td>
                                        <td><span className="rp-badge">{p.reg_no}</span></td>
                                        <td className="rp-amount">₹{parseFloat(p.amount).toLocaleString('en-IN')}</td>
                                        <td>{p.payment_mode}</td>
                                        <td>{new Date(p.paid_at).toLocaleDateString('en-IN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="rp-card">
                    <div className="rp-card-header"><h2>Monthly Collection</h2></div>
                    <div className="rp-chart-list">
                        {(stats?.monthlyCollection||[]).map(m => {
                            const max = Math.max(...(stats.monthlyCollection||[]).map(x=>x.total),1);
                            const pct = Math.round(m.total/max*100);
                            return (
                                <div key={m.month} className="rp-chart-row">
                                    <span className="rp-chart-label">{m.month}</span>
                                    <div className="rp-chart-bar-wrap"><div className="rp-chart-bar" style={{width:`${pct}%`}}/></div>
                                    <span className="rp-chart-value">₹{parseFloat(m.total).toLocaleString('en-IN')}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
