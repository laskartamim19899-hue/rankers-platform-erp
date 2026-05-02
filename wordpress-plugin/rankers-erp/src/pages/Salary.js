import { useState, useEffect } from '@wordpress/element';
import { api } from '../api/client';

export default function Salary() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ staffProfileId:'', month:new Date().toISOString().substring(0,7), basicSalary:0, allowances:0, deductions:0, paymentMode:'CASH', transactionId:'', remarks:'' });

    const loadData = () => {
        setLoading(true);
        api.get('/salary/staff').then(r => setStaff(r.data)).finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const handlePayClick = (person) => {
        setForm({
            staffProfileId: person.id,
            month: new Date().toISOString().substring(0,7),
            basicSalary: person.base_salary,
            allowances: 0,
            deductions: 0,
            paymentMode: 'CASH',
            transactionId: '',
            remarks: ''
        });
        setShowForm(true);
    };

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/salary/pay', form);
            setShowForm(false);
            loadData();
        } catch(err) {
            alert('Error recording salary');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rp-page">
            <div className="rp-page-header">
                <div><h1>Salary Management</h1><p>Process staff payroll and generate slips</p></div>
            </div>

            {showForm && (
                <div className="rp-card rp-mb">
                    <div className="rp-card-header"><h2>Process Salary</h2></div>
                    <form onSubmit={submit} className="rp-form-grid" style={{padding:'20px'}}>
                        <div className="rp-field"><label>Month (YYYY-MM)</label><input type="month" required value={form.month} onChange={e=>setForm({...form,month:e.target.value})} /></div>
                        <div className="rp-field"><label>Basic Salary (₹)</label><input type="number" required value={form.basicSalary} onChange={e=>setForm({...form,basicSalary:parseFloat(e.target.value)})} /></div>
                        <div className="rp-field"><label>Allowances (₹)</label><input type="number" value={form.allowances} onChange={e=>setForm({...form,allowances:parseFloat(e.target.value)})} /></div>
                        <div className="rp-field"><label>Deductions (₹)</label><input type="number" value={form.deductions} onChange={e=>setForm({...form,deductions:parseFloat(e.target.value)})} /></div>
                        <div className="rp-field">
                            <label>Net Salary</label>
                            <input disabled value={`₹${(form.basicSalary + form.allowances - form.deductions).toLocaleString('en-IN')}`} />
                        </div>
                        <div className="rp-field"><label>Payment Mode</label>
                            <select value={form.paymentMode} onChange={e=>setForm({...form,paymentMode:e.target.value})}>
                                <option>CASH</option>
                                <option>BANK_TRANSFER</option>
                                <option>CHEQUE</option>
                                <option>UPI</option>
                            </select>
                        </div>
                        <div className="rp-field"><label>Transaction ID</label><input value={form.transactionId} onChange={e=>setForm({...form,transactionId:e.target.value})} /></div>
                        <div className="rp-field"><label>Remarks</label><input value={form.remarks} onChange={e=>setForm({...form,remarks:e.target.value})} /></div>
                        <div className="rp-form-actions rp-col-2">
                            <button type="submit" className="rp-btn rp-btn-primary" disabled={saving}>{saving?'Processing...':'Confirm Payment'}</button>
                            <button type="button" className="rp-btn" onClick={()=>setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="rp-card">
                {loading ? <div className="rp-loading"><div className="rp-spinner"/></div> : (
                    <div className="rp-table-wrap">
                        <table className="rp-table">
                            <thead><tr><th>Staff Name</th><th>Designation</th><th>Base Salary</th><th>Last Paid</th><th>Action</th></tr></thead>
                            <tbody>
                                {staff.map(s => {
                                    const lastRecord = s.salary_records?.[0];
                                    return (
                                        <tr key={s.id}>
                                            <td><strong>{s.name}</strong><br/><small>{s.email}</small></td>
                                            <td>{s.designation} <br/><small>{s.department}</small></td>
                                            <td>₹{parseFloat(s.base_salary).toLocaleString('en-IN')}</td>
                                            <td>{lastRecord ? `${lastRecord.month} (₹${lastRecord.net_salary})` : 'Never'}</td>
                                            <td><button className="rp-btn rp-btn-sm rp-btn-success" onClick={()=>handlePayClick(s)}>Pay Salary</button></td>
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
