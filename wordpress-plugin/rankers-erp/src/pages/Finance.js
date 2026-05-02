import { useState, useEffect } from '@wordpress/element';
import { api } from '../api/client';

export default function Finance() {
    const [dues, setDues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('dues'); // dues | ledger
    const [ledger, setLedger] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [paymentForm, setPaymentForm] = useState(null);
    const [payAmount, setPayAmount] = useState('');
    const [payMode, setPayMode] = useState('CASH');
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    const loadDues = () => {
        setLoading(true);
        api.get('/finance/dues').then(r => setDues(r.data)).finally(() => setLoading(false));
    };

    const loadLedger = (q) => {
        if (!q) return;
        setLoading(true);
        api.get(`/finance/ledger?q=${encodeURIComponent(q)}`).then(r => setLedger(r.data)).finally(() => setLoading(false));
    };

    useEffect(() => {
        if (tab === 'dues') loadDues();
    }, [tab]);

    const handleSearch = (e) => {
        e.preventDefault();
        loadLedger(searchQuery);
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setSaving(true); setMsg('');
        try {
            await api.post('/finance/payments', {
                feeIds: paymentForm.feeIds,
                studentId: paymentForm.studentId,
                amount: payAmount,
                paymentMode: payMode
            });
            setMsg('Payment recorded successfully!');
            setPaymentForm(null);
            setPayAmount('');
            if (tab === 'dues') loadDues();
            else loadLedger(searchQuery);
        } catch (err) {
            setMsg(err.response?.data?.message || 'Error recording payment');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rp-page">
            <div className="rp-page-header">
                <div><h1>Finance</h1><p>Manage fees, payments, and dues</p></div>
            </div>

            {msg && <div className={`rp-alert ${msg.includes('Error') ? 'rp-alert-error' : 'rp-alert-success'}`}>{msg}</div>}

            <div className="rp-card">
                <div className="rp-card-toolbar">
                    <div className="rp-tabs">
                        <button className={`rp-tab${tab==='dues'?' active':''}`} onClick={()=>setTab('dues')}>Outstanding Dues</button>
                        <button className={`rp-tab${tab==='ledger'?' active':''}`} onClick={()=>setTab('ledger')}>Student Ledger</button>
                    </div>
                </div>

                {tab === 'dues' && (
                    <div className="rp-table-wrap">
                        {loading ? <div className="rp-loading"><div className="rp-spinner"/></div> : (
                            <table className="rp-table">
                                <thead><tr><th>Student</th><th>Reg No</th><th>Course</th><th>Due Date</th><th>Amount</th><th>Late Fee</th><th>Paid</th><th>Action</th></tr></thead>
                                <tbody>
                                    {dues.length === 0 && <tr><td colSpan={8} style={{textAlign:'center',padding:'2rem'}}>No outstanding dues</td></tr>}
                                    {dues.map(d => (
                                        <tr key={d.id}>
                                            <td><strong>{d.student_name}</strong></td>
                                            <td><span className="rp-badge">{d.reg_no}</span></td>
                                            <td>{d.course_name} <br/><small>{d.type} {d.month||''}</small></td>
                                            <td>{new Date(d.due_date).toLocaleDateString()}</td>
                                            <td>₹{d.amount}</td>
                                            <td style={{color:'red'}}>₹{d.late_fee}</td>
                                            <td style={{color:'green'}}>₹{d.total_paid}</td>
                                            <td>
                                                <button className="rp-btn rp-btn-sm rp-btn-primary" onClick={() => setPaymentForm({studentId: d.student_id, feeIds: [d.id], totalDue: (d.amount + d.late_fee - d.total_paid)})}>Pay</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {tab === 'ledger' && (
                    <div>
                        <form onSubmit={handleSearch} style={{display:'flex', gap:'10px', marginBottom:'20px', padding:'15px', background:'#f9fafb', borderRadius:'6px'}}>
                            <input className="rp-field" style={{flex:1}} placeholder="Search student by Name or Reg No..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} />
                            <button className="rp-btn rp-btn-primary" type="submit">Search</button>
                        </form>
                        {loading ? <div className="rp-loading"><div className="rp-spinner"/></div> : (
                            <div>
                                {ledger.length === 0 && searchQuery && <div style={{textAlign:'center',padding:'2rem'}}>No students found</div>}
                                {ledger.map(l => (
                                    <div key={l.student.id} style={{border:'1px solid #e5e7eb', borderRadius:'8px', padding:'20px', marginBottom:'20px'}}>
                                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'15px'}}>
                                            <div>
                                                <h3 style={{margin:'0 0 5px 0'}}>{l.student.user.name} <span className="rp-badge">{l.student.regNo}</span></h3>
                                                <div style={{color:'#6b7280', fontSize:'14px'}}>{l.student.phone} | {l.student.user.email}</div>
                                            </div>
                                            <div style={{textAlign:'right'}}>
                                                <div style={{fontSize:'20px', fontWeight:'bold', color: l.summary.totalRemaining > 0 ? '#ef4444' : '#10b981'}}>
                                                    Balance: ₹{l.summary.totalRemaining.toLocaleString('en-IN')}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <table className="rp-table" style={{marginTop:'15px'}}>
                                            <thead><tr><th>Type</th><th>Month</th><th>Due Date</th><th>Total</th><th>Paid</th><th>Bal</th></tr></thead>
                                            <tbody>
                                                {[...l.academicFees, ...l.hostelFees].map(f => (
                                                    <tr key={f.id}>
                                                        <td>{f.type}</td>
                                                        <td>{f.month||'—'}</td>
                                                        <td>{new Date(f.dueDate).toLocaleDateString()}</td>
                                                        <td>₹{f.amount + f.lateFee}</td>
                                                        <td>₹{f.totalPaid}</td>
                                                        <td style={{fontWeight:'bold', color: f.remaining > 0 ? 'red' : 'green'}}>₹{f.remaining}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {l.summary.totalRemaining > 0 && (
                                            <div style={{marginTop:'15px'}}>
                                                <button className="rp-btn rp-btn-primary" onClick={() => setPaymentForm({
                                                    studentId: l.student.id,
                                                    feeIds: [...l.academicFees, ...l.hostelFees].filter(f=>f.remaining>0).map(f=>f.id),
                                                    totalDue: l.summary.totalRemaining
                                                })}>Settle Balance</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {paymentForm && (
                <div className="rp-modal">
                    <div className="rp-modal-content">
                        <h2>Record Payment</h2>
                        <form onSubmit={handlePayment}>
                            <div className="rp-field">
                                <label>Total Due</label>
                                <input type="text" readOnly value={`₹${paymentForm.totalDue}`} disabled />
                            </div>
                            <div className="rp-field">
                                <label>Payment Amount (₹)</label>
                                <input type="number" required max={paymentForm.totalDue} value={payAmount} onChange={e=>setPayAmount(e.target.value)} />
                            </div>
                            <div className="rp-field">
                                <label>Payment Mode</label>
                                <select value={payMode} onChange={e=>setPayMode(e.target.value)}>
                                    <option>CASH</option>
                                    <option>UPI</option>
                                    <option>CARD</option>
                                    <option>BANK_TRANSFER</option>
                                </select>
                            </div>
                            <div className="rp-form-actions" style={{marginTop:'20px'}}>
                                <button type="submit" className="rp-btn rp-btn-primary" disabled={saving}>{saving?'Saving...':'Confirm Payment'}</button>
                                <button type="button" className="rp-btn" onClick={()=>setPaymentForm(null)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
