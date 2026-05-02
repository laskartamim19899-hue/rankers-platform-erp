import { useState, useEffect } from '@wordpress/element';
import { api } from '../api/client';

export default function Inventory() {
    const [items, setItems] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showItemForm, setShowItemForm] = useState(false);
    const [showIssueForm, setShowIssueForm] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [itemForm, setItemForm] = useState({ name:'', category:'', totalQty:'', description:'' });
    const [issueForm, setIssueForm] = useState({ itemId:'', studentId:'', dueDate:'' });

    const loadData = () => {
        setLoading(true);
        Promise.all([
            api.get('/inventory'),
            api.get('/students')
        ]).then(([i, s]) => {
            setItems(i.data);
            setStudents(s.data.filter(st => st.status === 'APPROVED'));
        }).finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const submitItem = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            await api.post('/inventory', itemForm);
            setShowItemForm(false); loadData();
        } catch(err) { alert('Error adding item'); }
        finally { setSaving(false); }
    };

    const submitIssue = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            await api.post('/inventory/issue', issueForm);
            setShowIssueForm(false); loadData();
        } catch(err) { alert(err.response?.data?.message || 'Error issuing item'); }
        finally { setSaving(false); }
    };

    const returnItem = async (id) => {
        if(!confirm('Mark as returned?')) return;
        await api.post('/inventory/return', { id, condition: 'GOOD' });
        loadData();
    };

    return (
        <div className="rp-page">
            <div className="rp-page-header">
                <div><h1>Inventory</h1><p>Manage books, equipment, and issuances</p></div>
                <div style={{display:'flex',gap:'10px'}}>
                    <button className="rp-btn rp-btn-secondary" onClick={() => {setShowIssueForm(true); setShowItemForm(false);}}>Issue Item</button>
                    <button className="rp-btn rp-btn-primary" onClick={() => {setShowItemForm(true); setShowIssueForm(false);}}>+ Add Item</button>
                </div>
            </div>

            {showItemForm && (
                <div className="rp-card rp-mb">
                    <div className="rp-card-header"><h2>Add New Item</h2></div>
                    <form onSubmit={submitItem} className="rp-form-grid" style={{padding:'20px'}}>
                        <div className="rp-field"><label>Item Name</label><input required value={itemForm.name} onChange={e=>setItemForm({...itemForm,name:e.target.value})} /></div>
                        <div className="rp-field"><label>Category</label><input required value={itemForm.category} onChange={e=>setItemForm({...itemForm,category:e.target.value})} placeholder="e.g. Books, Electronics" /></div>
                        <div className="rp-field"><label>Total Quantity</label><input type="number" required value={itemForm.totalQty} onChange={e=>setItemForm({...itemForm,totalQty:e.target.value})} /></div>
                        <div className="rp-field"><label>Description</label><input value={itemForm.description} onChange={e=>setItemForm({...itemForm,description:e.target.value})} /></div>
                        <div className="rp-form-actions rp-col-2">
                            <button type="submit" className="rp-btn rp-btn-primary" disabled={saving}>Save Item</button>
                            <button type="button" className="rp-btn" onClick={()=>setShowItemForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {showIssueForm && (
                <div className="rp-card rp-mb">
                    <div className="rp-card-header"><h2>Issue Item to Student</h2></div>
                    <form onSubmit={submitIssue} className="rp-form-grid" style={{padding:'20px'}}>
                        <div className="rp-field"><label>Item</label>
                            <select required value={issueForm.itemId} onChange={e=>setIssueForm({...issueForm,itemId:e.target.value})}>
                                <option value="">-- Select Item --</option>
                                {items.map(i=><option key={i.id} value={i.id} disabled={i.available_qty<1}>{i.name} ({i.available_qty} available)</option>)}
                            </select>
                        </div>
                        <div className="rp-field"><label>Student</label>
                            <select required value={issueForm.studentId} onChange={e=>setIssueForm({...issueForm,studentId:e.target.value})}>
                                <option value="">-- Select Student --</option>
                                {students.map(s=><option key={s.id} value={s.id}>{s.user?.name} ({s.regNo})</option>)}
                            </select>
                        </div>
                        <div className="rp-field"><label>Due Date</label><input type="date" required value={issueForm.dueDate} onChange={e=>setIssueForm({...issueForm,dueDate:e.target.value})} /></div>
                        <div className="rp-form-actions rp-col-2">
                            <button type="submit" className="rp-btn rp-btn-primary" disabled={saving}>Issue Item</button>
                            <button type="button" className="rp-btn" onClick={()=>setShowIssueForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="rp-card">
                {loading ? <div className="rp-loading"><div className="rp-spinner"/></div> : (
                    <div className="rp-table-wrap">
                        <table className="rp-table">
                            <thead><tr><th>Item</th><th>Category</th><th>Availability</th><th>Active Issuances</th></tr></thead>
                            <tbody>
                                {items.map(i => {
                                    const activeIssues = (i.issues || []).filter(iss => !iss.returned_on);
                                    return (
                                        <tr key={i.id}>
                                            <td><strong>{i.name}</strong></td>
                                            <td><span className="rp-badge">{i.category}</span></td>
                                            <td>{i.available_qty} / {i.total_qty}</td>
                                            <td>
                                                {activeIssues.length === 0 ? <span style={{color:'#9ca3af'}}>None</span> : (
                                                    <div style={{display:'flex',flexDirection:'column',gap:'5px'}}>
                                                        {activeIssues.map(iss => (
                                                            <div key={iss.id} style={{fontSize:'12px',background:'#f3f4f6',padding:'5px',borderRadius:'4px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                                                <span>{iss.student_name} (Due: {new Date(iss.due_date).toLocaleDateString()})</span>
                                                                <button onClick={()=>returnItem(iss.id)} style={{background:'none',border:'none',color:'#3b82f6',cursor:'pointer'}}>Return</button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
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
