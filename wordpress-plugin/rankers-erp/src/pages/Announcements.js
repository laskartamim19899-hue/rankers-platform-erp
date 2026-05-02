import { useState, useEffect } from '@wordpress/element';
import { api } from '../api/client';

export default function Announcements() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ title:'', content:'', type:'GENERAL', targetAudience:'ALL' });
    
    const loadData = () => {
        setLoading(true);
        api.get('/announcements').then(r => setAnnouncements(r.data)).finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/announcements', form);
            setShowForm(false);
            loadData();
        } catch(err) {
            alert('Error saving announcement');
        } finally {
            setSaving(false);
        }
    };

    const del = async (id) => {
        if(!confirm('Delete this announcement?')) return;
        await api.delete(`/announcements/${id}`);
        loadData();
    };

    return (
        <div className="rp-page">
            <div className="rp-page-header">
                <div><h1>Announcements</h1><p>Broadcast messages to students and staff</p></div>
                <button className="rp-btn rp-btn-primary" onClick={() => {setShowForm(true); setForm({title:'', content:'', type:'GENERAL', targetAudience:'ALL'});}}>
                    + New Announcement
                </button>
            </div>

            {showForm && (
                <div className="rp-card rp-mb">
                    <div className="rp-card-header"><h2>Create Announcement</h2></div>
                    <form onSubmit={submit} className="rp-form-grid" style={{padding:'20px'}}>
                        <div className="rp-field rp-col-2"><label>Title</label><input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} /></div>
                        <div className="rp-field rp-col-2"><label>Content</label><textarea required rows={4} value={form.content} onChange={e=>setForm({...form,content:e.target.value})} /></div>
                        <div className="rp-field"><label>Type</label>
                            <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                                <option>GENERAL</option>
                                <option>ACADEMIC</option>
                                <option>URGENT</option>
                            </select>
                        </div>
                        <div className="rp-field"><label>Target Audience</label>
                            <select value={form.targetAudience} onChange={e=>setForm({...form,targetAudience:e.target.value})}>
                                <option>ALL</option>
                                <option>STUDENTS</option>
                                <option>STAFF</option>
                            </select>
                        </div>
                        <div className="rp-form-actions rp-col-2">
                            <button type="submit" className="rp-btn rp-btn-primary" disabled={saving}>{saving?'Saving...':'Publish'}</button>
                            <button type="button" className="rp-btn" onClick={()=>setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="rp-card">
                {loading ? <div className="rp-loading"><div className="rp-spinner"/></div> : (
                    <div style={{padding:'20px'}}>
                        {announcements.length === 0 && <p style={{textAlign:'center',color:'#6b7280'}}>No announcements found.</p>}
                        {announcements.map(a => (
                            <div key={a.id} style={{borderBottom:'1px solid #e5e7eb', paddingBottom:'15px', marginBottom:'15px'}}>
                                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                                    <div>
                                        <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                                            <h3 style={{margin:0}}>{a.title}</h3>
                                            {a.type === 'URGENT' && <span className="rp-badge" style={{background:'#fef2f2',color:'#ef4444'}}>URGENT</span>}
                                            <span className="rp-badge">{a.target_audience}</span>
                                        </div>
                                        <p style={{fontSize:'12px',color:'#6b7280',margin:'5px 0'}}>{new Date(a.created_at).toLocaleString()}</p>
                                    </div>
                                    <button className="rp-btn rp-btn-sm rp-btn-danger" onClick={()=>del(a.id)}>Delete</button>
                                </div>
                                <p style={{marginTop:'10px',whiteSpace:'pre-wrap'}}>{a.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
