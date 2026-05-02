import { useState, useEffect } from '@wordpress/element';
import { api } from '../api/client';

export default function Reports() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/reports/dashboard').then(r => setStats(r.data)).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="rp-loading"><div className="rp-spinner"/></div>;

    return (
        <div className="rp-page">
            <div className="rp-page-header">
                <div><h1>Reports</h1><p>System wide reports and analytics</p></div>
            </div>
            
            <div className="rp-grid-2">
                <div className="rp-card">
                    <div className="rp-card-header"><h2>Student Summary</h2></div>
                    <div style={{padding:'20px'}}>
                        <p><strong>Total Approved Students:</strong> {stats?.totalStudents}</p>
                        <p><strong>Pending Approvals:</strong> {stats?.pendingStudents}</p>
                        <p><strong>Hostel Residents:</strong> {stats?.hostelStudents}</p>
                    </div>
                </div>
                <div className="rp-card">
                    <div className="rp-card-header"><h2>Financial Summary</h2></div>
                    <div style={{padding:'20px'}}>
                        <p><strong>Total Collected:</strong> ₹{stats?.totalCollected?.toLocaleString('en-IN')}</p>
                        <p><strong>Outstanding Dues:</strong> ₹{stats?.totalDues?.toLocaleString('en-IN')}</p>
                        <p><strong>Total Expenses:</strong> ₹{stats?.totalExpenses?.toLocaleString('en-IN')}</p>
                    </div>
                </div>
            </div>
            
            <div className="rp-card rp-mt">
                <div className="rp-card-header"><h2>Monthly Collection Trend</h2></div>
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
    );
}
