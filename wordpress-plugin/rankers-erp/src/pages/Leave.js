import { useState, useEffect } from '@wordpress/element';
import { api } from '../api/client';

export default function Leave() {
    const [passes, setPasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ studentId:'', reason:'', destination:'', startDate:'', endDate:'' });

    const loadData = () => {
        setLoading(true);
        Promise.all([
            api.get('/leave'),
            api.get('/students')
        ]).then(([p, s]) => {
            setPasses(p.data);
            setStudents(s.data.filter(st => st.status === 'APPROVED' && st.isResidential));
        }).finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const submit = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            await api.post('/leave', {...form, issuedBy: 'Admin', status: 'APPROVED'});
            setShowForm(false); loadData();
        } catch(err) { alert('Error issuing pass'); }
        finally { setSaving(false); }
    };

    const markReturned = async (id) => {
        await api.put(`/leave/${id}`, { returnedAt: new Date().toISOString() });
        loadData();
    };

    return (
        <div className="rp-page">
            <div className="rp-page-header">
                <div><h1>Leave Passes</h1><p>Manage hostel exit/entry passes</p></div>
                <button className="rp-btn rp-btn-primary" onClick={() => {setShowForm(true);}}>+ Issue Pass</button>
            </div>

            {showForm && (
                <div className="rp-card rp-mb">
                    <div className="rp-card-header"><h2>Issue Leave Pass</h2></div>
                    <form onSubmit={submit} className="rp-form-grid" style={{padding:'20px'}}>
                        <div className="rp-field"><label>Student</label>
                            <select required value={form.studentId} onChange={e=>setForm({...form,studentId:e.target.value})}>
                                <option value="">-- Select Student --</option>
                                {students.map(s=><option key={s.id} value={s.id}>{s.user?.name} ({s.regNo})</option>)}
                            </select>
                        </div>
                        <div className="rp-field"><label>Destination</label><input required value={form.destination} onChange={e=>setForm({...form,destination:e.target.value})} /></div>
                        <div className="rp-field"><label>Start Date</label><input type="date" required value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})} /></div>
                        <div className="rp-field"><label>End Date</label><input type="date" required value={form.endDate} onChange={e=>setForm({...form,endDate:e.target.value})} /></div>
                        <div className="rp-field rp-col-2"><label>Reason</label><textarea required value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} /></div>
                        
                        <div className="rp-form-actions rp-col-2">
                            <button type="submit" className="rp-btn rp-btn-primary" disabled={saving}>Issue Pass</button>
                            <button type="button" className="rp-btn" onClick={()=>setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="rp-card">
                {loading ? <div className="rp-loading"><div className="rp-spinner"/></div> : (
                    <div className="rp-table-wrap">
                        <table className="rp-table">
                            <thead><tr><th>Pass No</th><th>Student</th><th>Destination / Reason</th><th>Duration</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody>
                                {passes.map(p => (
                                    <tr key={p.id}>
                                        <td><strong>{p.pass_no}</strong></td>
                                        <td>{p.student_name} <br/><small>{p.reg_no}</small></td>
                                        <td>{p.destination} <br/><small>{p.reason}</small></td>
                                        <td>{new Date(p.start_date).toLocaleDateString()} to {new Date(p.end_date).toLocaleDateString()}</td>
                                        <td>
                                            {p.returned_at ? <span className="rp-badge" style={{background:'#d1fae5',color:'#065f46'}}>RETURNED</span> : <span className="rp-badge" style={{background:'#fef3c7',color:'#92400e'}}>OUT</span>}
                                        </td>
                                        <td>
                                            {!p.returned_at && <button className="rp-btn rp-btn-sm rp-btn-primary" onClick={()=>markReturned(p.id)}>Mark Returned</button>}
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
