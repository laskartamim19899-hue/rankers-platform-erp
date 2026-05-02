import { useState, useEffect } from '@wordpress/element';
import { api } from '../api/client';

export default function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ title:'', category:'OTHER', amount:'', date:new Date().toISOString().split('T')[0], description:'', payeeName:'', purpose:'' });
    
    const categories = ['SALARY', 'RENT', 'FOOD', 'MAINTENANCE', 'EQUIPMENT', 'OTHER'];

    const loadData = () => {
        setLoading(true);
        api.get('/expenses').then(r => setExpenses(r.data)).finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/expenses', form);
            setShowForm(false);
            loadData();
        } catch(err) {
            alert('Error saving expense');
        } finally {
            setSaving(false);
        }
    };

    const deleteExpense = async (id) => {
        if(!confirm('Are you sure you want to delete this expense?')) return;
        await api.delete(`/expenses/${id}`);
        loadData();
    };

    return (
        <div className="rp-page">
            <div className="rp-page-header">
                <div><h1>Expenses</h1><p>Track institutional expenses</p></div>
                <button className="rp-btn rp-btn-primary" onClick={() => {setShowForm(true); setForm({title:'', category:'OTHER', amount:'', date:new Date().toISOString().split('T')[0], description:'', payeeName:'', purpose:''});}}>
                    + Record Expense
                </button>
            </div>

            {showForm && (
                <div className="rp-card rp-mb">
                    <div className="rp-card-header"><h2>Record New Expense</h2></div>
                    <form onSubmit={submit} className="rp-form-grid">
                        <div className="rp-field"><label>Title / Name</label><input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} /></div>
                        <div className="rp-field"><label>Category</label>
                            <select required value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                                {categories.map(c=><option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="rp-field"><label>Amount (₹)</label><input type="number" required value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} /></div>
                        <div className="rp-field"><label>Date</label><input type="date" required value={form.date} onChange={e=>setForm({...form,date:e.target.value})} /></div>
                        <div className="rp-field"><label>Payee Name</label><input value={form.payeeName} onChange={e=>setForm({...form,payeeName:e.target.value})} /></div>
                        <div className="rp-field"><label>Purpose</label><input value={form.purpose} onChange={e=>setForm({...form,purpose:e.target.value})} /></div>
                        <div className="rp-field rp-col-2"><label>Description</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
                        <div className="rp-form-actions rp-col-2">
                            <button type="submit" className="rp-btn rp-btn-primary" disabled={saving}>{saving?'Saving...':'Save Expense'}</button>
                            <button type="button" className="rp-btn" onClick={()=>setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="rp-card">
                {loading ? <div className="rp-loading"><div className="rp-spinner"/></div> : (
                    <div className="rp-table-wrap">
                        <table className="rp-table">
                            <thead><tr><th>Date</th><th>Title</th><th>Category</th><th>Payee</th><th>Amount</th><th>Action</th></tr></thead>
                            <tbody>
                                {expenses.map(e => (
                                    <tr key={e.id}>
                                        <td>{new Date(e.date).toLocaleDateString()}</td>
                                        <td><strong>{e.title}</strong><br/><small>{e.description}</small></td>
                                        <td><span className="rp-badge">{e.category}</span></td>
                                        <td>{e.payee_name || '—'}</td>
                                        <td className="rp-amount" style={{color:'red'}}>-₹{e.amount}</td>
                                        <td><button className="rp-btn rp-btn-sm rp-btn-danger" onClick={()=>deleteExpense(e.id)}>Delete</button></td>
                                    </tr>
                                ))}
                                {expenses.length === 0 && <tr><td colSpan={6} style={{textAlign:'center',padding:'20px'}}>No expenses recorded.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
