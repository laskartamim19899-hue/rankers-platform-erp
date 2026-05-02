import { useState, useEffect } from '@wordpress/element';
import { api } from '../api/client';

export default function Students() {
    const [students, setStudents] = useState([]);
    const [tab, setTab]           = useState('all'); // all | pending
    const [search, setSearch]     = useState('');
    const [loading, setLoading]   = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [courses, setCourses]   = useState([]);
    const [batches, setBatches]   = useState([]);
    const [form, setForm]         = useState({ name:'',email:'',password:'',guardianName:'',dob:'',gender:'MALE',phone:'',address:'',batchId:'',academicFee:'',isResidential:false,monthlyHostelFee:'' });
    const [saving, setSaving]     = useState(false);
    const [msg, setMsg]           = useState('');

    const load = () => {
        setLoading(true);
        const endpoint = tab === 'pending' ? '/students/pending' : '/students';
        api.get(endpoint).then(r => setStudents(r.data)).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [tab]);
    useEffect(() => {
        api.get('/academic/courses').then(r => setCourses(r.data));
        api.get('/academic/batches').then(r => setBatches(r.data));
    }, []);

    const approve = async id => {
        await api.put(`/students/${id}/approve`);
        setMsg('Student approved!'); load();
    };

    const del = async id => {
        if (!confirm('Delete this student permanently?')) return;
        await api.delete(`/students/${id}`);
        setMsg('Student deleted.'); load();
    };

    const submit = async e => {
        e.preventDefault(); setSaving(true); setMsg('');
        try {
            await api.post('/students', form);
            setMsg('Student registered successfully!');
            setShowForm(false);
            setForm({ name:'',email:'',password:'',guardianName:'',dob:'',gender:'MALE',phone:'',address:'',batchId:'',academicFee:'',isResidential:false,monthlyHostelFee:'' });
            load();
        } catch(err) { setMsg(err.response?.data?.message || 'Error'); }
        finally { setSaving(false); }
    };

    const filtered = students.filter(s =>
        s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.regNo?.toLowerCase().includes(search.toLowerCase()) ||
        s.user?.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="rp-page">
            <div className="rp-page-header">
                <div><h1>Students</h1><p>Manage student registrations and profiles</p></div>
                <button className="rp-btn rp-btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Student</button>
            </div>
            {msg && <div className={`rp-alert ${msg.includes('Error')||msg.includes('error') ? 'rp-alert-error':'rp-alert-success'}`}>{msg}</div>}

            {showForm && (
                <div className="rp-card rp-mb">
                    <div className="rp-card-header"><h2>Register New Student</h2></div>
                    <form onSubmit={submit} className="rp-form-grid">
                        <div className="rp-field"><label>Full Name *</label><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
                        <div className="rp-field"><label>Email *</label><input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
                        <div className="rp-field"><label>Password</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Default: password123" /></div>
                        <div className="rp-field"><label>Guardian Name *</label><input required value={form.guardianName} onChange={e=>setForm({...form,guardianName:e.target.value})} /></div>
                        <div className="rp-field"><label>Date of Birth *</label><input type="date" required value={form.dob} onChange={e=>setForm({...form,dob:e.target.value})} /></div>
                        <div className="rp-field"><label>Gender</label><select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}><option>MALE</option><option>FEMALE</option><option>OTHER</option></select></div>
                        <div className="rp-field"><label>Phone *</label><input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></div>
                        <div className="rp-field rp-col-2"><label>Address *</label><textarea required value={form.address} onChange={e=>setForm({...form,address:e.target.value})} rows={2}/></div>
                        <div className="rp-field"><label>Batch</label>
                            <select value={form.batchId} onChange={e=>setForm({...form,batchId:e.target.value})}>
                                <option value="">-- Select Batch --</option>
                                {batches.map(b=><option key={b.id} value={b.id}>{b.name} ({b.course_name})</option>)}
                            </select>
                        </div>
                        <div className="rp-field"><label>Academic Fee (₹)</label><input type="number" value={form.academicFee} onChange={e=>setForm({...form,academicFee:e.target.value})} /></div>
                        <div className="rp-field rp-checkbox-field">
                            <label><input type="checkbox" checked={form.isResidential} onChange={e=>setForm({...form,isResidential:e.target.checked})} /> Residential Student</label>
                        </div>
                        {form.isResidential && <div className="rp-field"><label>Monthly Hostel Fee (₹)</label><input type="number" value={form.monthlyHostelFee} onChange={e=>setForm({...form,monthlyHostelFee:e.target.value})} /></div>}
                        <div className="rp-form-actions">
                            <button type="submit" className="rp-btn rp-btn-primary" disabled={saving}>{saving?'Saving...':'Register Student'}</button>
                            <button type="button" className="rp-btn" onClick={()=>setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="rp-card">
                <div className="rp-card-toolbar">
                    <div className="rp-tabs">
                        <button className={`rp-tab${tab==='all'?' active':''}`} onClick={()=>setTab('all')}>All Students</button>
                        <button className={`rp-tab${tab==='pending'?' active':''}`} onClick={()=>setTab('pending')}>Pending Approval</button>
                    </div>
                    <input className="rp-search" placeholder="Search by name, reg no, email…" value={search} onChange={e=>setSearch(e.target.value)} />
                </div>
                {loading ? <div className="rp-loading"><div className="rp-spinner"/></div> : (
                    <div className="rp-table-wrap">
                        <table className="rp-table">
                            <thead><tr><th>Name</th><th>Reg No</th><th>Email</th><th>Course</th><th>Status</th><th>Residential</th><th>Actions</th></tr></thead>
                            <tbody>
                                {filtered.length === 0 && <tr><td colSpan={7} style={{textAlign:'center',padding:'2rem',color:'#9ca3af'}}>No students found</td></tr>}
                                {filtered.map(s => (
                                    <tr key={s.id}>
                                        <td><strong>{s.user?.name}</strong></td>
                                        <td><span className="rp-badge">{s.regNo || '—'}</span></td>
                                        <td>{s.user?.email}</td>
                                        <td>{s.courses?.map(c=>c.name).join(', ') || '—'}</td>
                                        <td><span className={`rp-status rp-status-${s.status?.toLowerCase()}`}>{s.status}</span></td>
                                        <td>{s.isResidential ? '✅' : '—'}</td>
                                        <td className="rp-actions">
                                            {s.status === 'PENDING' && <button className="rp-btn rp-btn-sm rp-btn-success" onClick={()=>approve(s.id)}>Approve</button>}
                                            <button className="rp-btn rp-btn-sm rp-btn-danger" onClick={()=>del(s.id)}>Delete</button>
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
