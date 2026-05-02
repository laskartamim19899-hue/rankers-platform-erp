import { useState, useEffect } from '@wordpress/element';
import { api } from '../api/client';

export default function Staff() {
    const [staff, setStaff] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ userId:'', designation:'', department:'', baseSalary:'', bankAccount:'', ifscCode:'', joiningDate:new Date().toISOString().split('T')[0] });

    const loadData = () => {
        setLoading(true);
        Promise.all([
            api.get('/salary/staff').then(r => setStaff(r.data)),
            api.get('/users').then(r => setUsers(r.data))
        ]).finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/salary/staff', form);
            setShowForm(false);
            loadData();
        } catch(err) {
            alert(err.response?.data?.message || 'Error saving staff profile');
        } finally {
            setSaving(false);
        }
    };

    const eligibleUsers = users.filter(u => u.role !== 'STUDENT' && !staff.some(s => s.user_id === u.id));

    return (
        <div className="rp-page">
            <div className="rp-page-header">
                <div><h1>Staff Profiles</h1><p>Manage employees and teachers</p></div>
                <button className="rp-btn rp-btn-primary" onClick={() => {setShowForm(true); setForm({...form, userId:''});}}>
                    + Add Staff Profile
                </button>
            </div>

            {showForm && (
                <div className="rp-card rp-mb">
                    <div className="rp-card-header"><h2>Create Staff Profile</h2></div>
                    <form onSubmit={submit} className="rp-form-grid" style={{padding:'20px'}}>
                        <div className="rp-field"><label>User Account</label>
                            <select required value={form.userId} onChange={e=>setForm({...form,userId:e.target.value})}>
                                <option value="">-- Select User --</option>
                                {eligibleUsers.map(u=><option key={u.id} value={u.id}>{u.name} ({u.email} - {u.role})</option>)}
                            </select>
                        </div>
                        <div className="rp-field"><label>Designation</label><input required value={form.designation} onChange={e=>setForm({...form,designation:e.target.value})} /></div>
                        <div className="rp-field"><label>Department</label><input value={form.department} onChange={e=>setForm({...form,department:e.target.value})} /></div>
                        <div className="rp-field"><label>Base Salary (₹)</label><input type="number" required value={form.baseSalary} onChange={e=>setForm({...form,baseSalary:parseFloat(e.target.value)})} /></div>
                        <div className="rp-field"><label>Bank Account Number</label><input value={form.bankAccount} onChange={e=>setForm({...form,bankAccount:e.target.value})} /></div>
                        <div className="rp-field"><label>IFSC Code</label><input value={form.ifscCode} onChange={e=>setForm({...form,ifscCode:e.target.value})} /></div>
                        <div className="rp-field"><label>Joining Date</label><input type="date" required value={form.joiningDate} onChange={e=>setForm({...form,joiningDate:e.target.value})} /></div>
                        
                        <div className="rp-form-actions rp-col-2">
                            <button type="submit" className="rp-btn rp-btn-primary" disabled={saving}>{saving?'Saving...':'Save Profile'}</button>
                            <button type="button" className="rp-btn" onClick={()=>setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="rp-card">
                {loading ? <div className="rp-loading"><div className="rp-spinner"/></div> : (
                    <div className="rp-table-wrap">
                        <table className="rp-table">
                            <thead><tr><th>Name</th><th>Role</th><th>Designation</th><th>Department</th><th>Joined</th></tr></thead>
                            <tbody>
                                {staff.map(s => (
                                    <tr key={s.id}>
                                        <td><strong>{s.name}</strong><br/><small>{s.email}</small></td>
                                        <td><span className="rp-badge">{s.role}</span></td>
                                        <td>{s.designation}</td>
                                        <td>{s.department || '—'}</td>
                                        <td>{new Date(s.joining_date).toLocaleDateString()}</td>
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
