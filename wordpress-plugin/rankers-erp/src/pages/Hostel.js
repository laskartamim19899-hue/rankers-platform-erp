import { useState, useEffect } from '@wordpress/element';
import { api } from '../api/client';

export default function Hostel() {
    const [hostels, setHostels] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ studentId:'', hostelId:'', joinDate:new Date().toISOString().split('T')[0] });

    const loadData = () => {
        setLoading(true);
        Promise.all([
            api.get('/hostel'),
            api.get('/hostel/allocations'),
            api.get('/students')
        ]).then(([h, a, s]) => {
            setHostels(h.data);
            setAllocations(a.data);
            setStudents(s.data.filter(st => st.status === 'APPROVED' && st.isResidential));
        }).finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/hostel/allocate', form);
            setShowForm(false);
            loadData();
        } catch(err) {
            alert(err.response?.data?.message || 'Error allocating room');
        } finally {
            setSaving(false);
        }
    };

    const unallocated = students.filter(s => !allocations.some(a => a.student_id === s.id && (!a.leave_date || new Date(a.leave_date) > new Date())));

    return (
        <div className="rp-page">
            <div className="rp-page-header">
                <div><h1>Hostel Management</h1><p>Manage rooms and resident students</p></div>
                <button className="rp-btn rp-btn-primary" onClick={() => {setShowForm(true); setForm({...form, studentId:''});}}>
                    + Allocate Room
                </button>
            </div>

            {showForm && (
                <div className="rp-card rp-mb">
                    <div className="rp-card-header"><h2>Allocate Room</h2></div>
                    <form onSubmit={submit} className="rp-form-grid" style={{padding:'20px'}}>
                        <div className="rp-field"><label>Residential Student</label>
                            <select required value={form.studentId} onChange={e=>setForm({...form,studentId:e.target.value})}>
                                <option value="">-- Select Student --</option>
                                {unallocated.map(s=><option key={s.id} value={s.id}>{s.user?.name} ({s.regNo})</option>)}
                            </select>
                        </div>
                        <div className="rp-field"><label>Hostel Room</label>
                            <select required value={form.hostelId} onChange={e=>setForm({...form,hostelId:e.target.value})}>
                                <option value="">-- Select Room --</option>
                                {hostels.map(h=><option key={h.id} value={h.id} disabled={h.occupancy >= h.capacity}>{h.name} - Room {h.room_number} ({h.occupancy}/{h.capacity})</option>)}
                            </select>
                        </div>
                        <div className="rp-field"><label>Join Date</label><input type="date" required value={form.joinDate} onChange={e=>setForm({...form,joinDate:e.target.value})} /></div>
                        
                        <div className="rp-form-actions rp-col-2">
                            <button type="submit" className="rp-btn rp-btn-primary" disabled={saving}>{saving?'Saving...':'Allocate'}</button>
                            <button type="button" className="rp-btn" onClick={()=>setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="rp-grid-2">
                <div className="rp-card">
                    <div className="rp-card-header"><h2>Rooms Status</h2></div>
                    {loading ? <div className="rp-loading"><div className="rp-spinner"/></div> : (
                        <table className="rp-table">
                            <thead><tr><th>Room</th><th>Building</th><th>Occupancy</th></tr></thead>
                            <tbody>
                                {hostels.map(h => (
                                    <tr key={h.id}>
                                        <td><strong>{h.room_number}</strong></td>
                                        <td>{h.name}</td>
                                        <td>
                                            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                                                <div style={{flex:1,height:'8px',background:'#e5e7eb',borderRadius:'4px',overflow:'hidden'}}>
                                                    <div style={{height:'100%',background:h.occupancy>=h.capacity?'#ef4444':'#10b981',width:`${(h.occupancy/h.capacity)*100}%`}}></div>
                                                </div>
                                                <span style={{fontSize:'12px'}}>{h.occupancy}/{h.capacity}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="rp-card">
                    <div className="rp-card-header"><h2>Recent Allocations</h2></div>
                    {loading ? <div className="rp-loading"><div className="rp-spinner"/></div> : (
                        <table className="rp-table">
                            <thead><tr><th>Student</th><th>Room</th><th>Join Date</th></tr></thead>
                            <tbody>
                                {allocations.slice(0, 10).map(a => (
                                    <tr key={a.id}>
                                        <td><strong>{a.student_name}</strong><br/><small>{a.reg_no}</small></td>
                                        <td>{a.room_number}</td>
                                        <td>{new Date(a.join_date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
