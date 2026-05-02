import { useState, useEffect } from '@wordpress/element';
import { api } from '../api/client';

export default function Inquiries() {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = () => {
        setLoading(true);
        api.get('/inquiries').then(r => setInquiries(r.data)).finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const updateStatus = async (id, status) => {
        await api.put(`/inquiries/${id}`, { status });
        loadData();
    };

    return (
        <div className="rp-page">
            <div className="rp-page-header">
                <div><h1>Inquiries</h1><p>Manage student leads and admission inquiries</p></div>
            </div>

            <div className="rp-card">
                {loading ? <div className="rp-loading"><div className="rp-spinner"/></div> : (
                    <div className="rp-table-wrap">
                        <table className="rp-table">
                            <thead><tr><th>Date</th><th>Student Name</th><th>Contact</th><th>Interest</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody>
                                {inquiries.length === 0 && <tr><td colSpan={6} style={{textAlign:'center',padding:'20px'}}>No inquiries found.</td></tr>}
                                {inquiries.map(i => (
                                    <tr key={i.id}>
                                        <td>{new Date(i.created_at).toLocaleDateString()}</td>
                                        <td><strong>{i.name}</strong><br/><small>{i.guardian_name}</small></td>
                                        <td>{i.phone}<br/><small>{i.email}</small></td>
                                        <td>{i.course_interest}</td>
                                        <td><span className={`rp-badge`} style={{background: i.status==='NEW'?'#fef3c7':(i.status==='FOLLOW_UP'?'#e0e7ff':(i.status==='ADMITTED'?'#d1fae5':'#f3f4f6'))}}>{i.status}</span></td>
                                        <td>
                                            <select value={i.status} onChange={(e)=>updateStatus(i.id, e.target.value)} style={{padding:'4px',fontSize:'12px',borderRadius:'4px',border:'1px solid #d1d5db'}}>
                                                <option value="NEW">New</option>
                                                <option value="FOLLOW_UP">Follow Up</option>
                                                <option value="ADMITTED">Admitted</option>
                                                <option value="CLOSED">Closed</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
