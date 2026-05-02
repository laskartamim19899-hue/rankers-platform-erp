import { useState, useEffect } from '@wordpress/element';
import { api } from '../api/client';

export default function GuestTeachers() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTeacherForm, setShowTeacherForm] = useState(false);
    const [showPayForm, setShowPayForm] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [tForm, setTForm] = useState({ name:'', phone:'', email:'', subject:'', qualification:'', ratePerClass:'' });
    const [pForm, setPForm] = useState({ guestTeacherId:'', month:new Date().toISOString().substring(0,7), classesHeld:'', ratePerClass:'', allowances:0 });

    const loadData = () => {
        setLoading(true);
        api.get('/guest').then(r => setTeachers(r.data)).finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const submitTeacher = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            await api.post('/guest', tForm);
            setShowTeacherForm(false); loadData();
        } catch(err) { alert('Error adding teacher'); }
        finally { setSaving(false); }
    };

    const submitPay = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            await api.post('/guest/pay', pForm);
            setShowPayForm(false); loadData();
        } catch(err) { alert('Error processing payment'); }
        finally { setSaving(false); }
    };

    return (
        <div className="rp-page">
            <div className="rp-page-header">
                <div><h1>Guest Teachers</h1><p>Manage external faculties and class-wise payments</p></div>
                <button className="rp-btn rp-btn-primary" onClick={() => {setShowTeacherForm(true); setShowPayForm(false);}}>+ Add Guest Teacher</button>
            </div>

            {showTeacherForm && (
                <div className="rp-card rp-mb">
                    <div className="rp-card-header"><h2>Add Guest Teacher</h2></div>
                    <form onSubmit={submitTeacher} className="rp-form-grid" style={{padding:'20px'}}>
                        <div className="rp-field"><label>Name</label><input required value={tForm.name} onChange={e=>setTForm({...tForm,name:e.target.value})} /></div>
                        <div className="rp-field"><label>Subject</label><input required value={tForm.subject} onChange={e=>setTForm({...tForm,subject:e.target.value})} /></div>
                        <div className="rp-field"><label>Rate Per Class (₹)</label><input type="number" required value={tForm.ratePerClass} onChange={e=>setTForm({...tForm,ratePerClass:e.target.value})} /></div>
                        <div className="rp-field"><label>Phone</label><input value={tForm.phone} onChange={e=>setTForm({...tForm,phone:e.target.value})} /></div>
                        <div className="rp-form-actions rp-col-2">
                            <button type="submit" className="rp-btn rp-btn-primary" disabled={saving}>Save Teacher</button>
                            <button type="button" className="rp-btn" onClick={()=>setShowTeacherForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {showPayForm && (
                <div className="rp-card rp-mb">
                    <div className="rp-card-header"><h2>Process Guest Payment</h2></div>
                    <form onSubmit={submitPay} className="rp-form-grid" style={{padding:'20px'}}>
                        <div className="rp-field"><label>Classes Held</label><input type="number" required value={pForm.classesHeld} onChange={e=>setPForm({...pForm,classesHeld:e.target.value})} /></div>
                        <div className="rp-field"><label>Allowances (₹)</label><input type="number" value={pForm.allowances} onChange={e=>setPForm({...pForm,allowances:e.target.value})} /></div>
                        <div className="rp-field"><label>Month</label><input type="month" required value={pForm.month} onChange={e=>setPForm({...pForm,month:e.target.value})} /></div>
                        <div className="rp-field"><label>Calculated Total</label><input disabled value={`₹${(pForm.classesHeld * pForm.ratePerClass) + Number(pForm.allowances)}`} /></div>
                        <div className="rp-form-actions rp-col-2">
                            <button type="submit" className="rp-btn rp-btn-primary" disabled={saving}>Process Payment</button>
                            <button type="button" className="rp-btn" onClick={()=>setShowPayForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="rp-card">
                {loading ? <div className="rp-loading"><div className="rp-spinner"/></div> : (
                    <div className="rp-table-wrap">
                        <table className="rp-table">
                            <thead><tr><th>Name</th><th>Subject</th><th>Rate/Class</th><th>Total Paid</th><th>Action</th></tr></thead>
                            <tbody>
                                {teachers.map(t => {
                                    const totalPaid = (t.payments||[]).reduce((sum, p) => sum + parseFloat(p.total_amount), 0);
                                    return (
                                        <tr key={t.id}>
                                            <td><strong>{t.name}</strong><br/><small>{t.phone}</small></td>
                                            <td>{t.subject}</td>
                                            <td>₹{t.rate_per_class}</td>
                                            <td>₹{totalPaid}</td>
                                            <td>
                                                <button className="rp-btn rp-btn-sm rp-btn-success" onClick={() => {
                                                    setPForm({...pForm, guestTeacherId: t.id, ratePerClass: t.rate_per_class, classesHeld:''});
                                                    setShowPayForm(true); setShowTeacherForm(false);
                                                }}>Pay</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
