import { useState, useEffect } from '@wordpress/element';
import { api } from '../api/client';

export default function Timetable() {
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [form, setForm] = useState({ batchId:'', day:'MON', startTime:'', endTime:'', subject:'', teacherName:'', roomNo:'' });

    useEffect(() => {
        api.get('/academic/batches').then(r => {
            setBatches(r.data);
            if(r.data.length > 0) {
                setSelectedBatch(r.data[0].id);
                setForm(f => ({...f, batchId: r.data[0].id}));
            }
        });
    }, []);

    const loadData = () => {
        if (!selectedBatch) { setLoading(false); return; }
        setLoading(true);
        api.get(`/timetable/${selectedBatch}`).then(r => setTimetable(r.data)).finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, [selectedBatch]);

    const submit = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            await api.post('/timetable/slots', form);
            setShowForm(false); loadData();
        } catch(err) { alert('Error adding slot'); }
        finally { setSaving(false); }
    };

    const del = async (id) => {
        if(!confirm('Delete this slot?')) return;
        await api.delete(`/timetable/slots/${id}`);
        loadData();
    };

    const days = ['MON','TUE','WED','THU','FRI','SAT','SUN'];

    return (
        <div className="rp-page">
            <div className="rp-page-header">
                <div><h1>Timetable</h1><p>Manage class schedules</p></div>
                <button className="rp-btn rp-btn-primary" onClick={() => setShowForm(true)}>+ Add Slot</button>
            </div>

            {showForm && (
                <div className="rp-card rp-mb">
                    <div className="rp-card-header"><h2>Add Timetable Slot</h2></div>
                    <form onSubmit={submit} className="rp-form-grid" style={{padding:'20px'}}>
                        <div className="rp-field"><label>Batch</label>
                            <select required value={form.batchId} onChange={e=>{setForm({...form,batchId:e.target.value}); setSelectedBatch(e.target.value);}}>
                                {batches.map(b=><option key={b.id} value={b.id}>{b.name} ({b.course_name})</option>)}
                            </select>
                        </div>
                        <div className="rp-field"><label>Day</label>
                            <select required value={form.day} onChange={e=>setForm({...form,day:e.target.value})}>
                                {days.map(d=><option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="rp-field"><label>Start Time</label><input type="time" required value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})} /></div>
                        <div className="rp-field"><label>End Time</label><input type="time" required value={form.endTime} onChange={e=>setForm({...form,endTime:e.target.value})} /></div>
                        <div className="rp-field"><label>Subject</label><input required value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} /></div>
                        <div className="rp-field"><label>Teacher Name</label><input value={form.teacherName} onChange={e=>setForm({...form,teacherName:e.target.value})} /></div>
                        <div className="rp-field"><label>Room No</label><input value={form.roomNo} onChange={e=>setForm({...form,roomNo:e.target.value})} /></div>
                        <div className="rp-form-actions rp-col-2">
                            <button type="submit" className="rp-btn rp-btn-primary" disabled={saving}>Save Slot</button>
                            <button type="button" className="rp-btn" onClick={()=>setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="rp-card">
                <div className="rp-card-toolbar">
                    <div className="rp-field" style={{marginBottom:0}}>
                        <label style={{display:'none'}}>Select Batch</label>
                        <select value={selectedBatch} onChange={e=>{setSelectedBatch(e.target.value); setForm({...form,batchId:e.target.value});}}>
                            {batches.map(b=><option key={b.id} value={b.id}>{b.name} ({b.course_name})</option>)}
                        </select>
                    </div>
                </div>
                {loading ? <div className="rp-loading"><div className="rp-spinner"/></div> : (
                    <div style={{padding:'20px'}}>
                        {!timetable || !timetable.slots || timetable.slots.length === 0 ? <p style={{textAlign:'center',color:'#6b7280'}}>No timetable slots found for this batch.</p> : (
                            <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
                                {days.map(d => {
                                    const daySlots = timetable.slots.filter(s => s.day === d);
                                    if(daySlots.length === 0) return null;
                                    return (
                                        <div key={d}>
                                            <h3 style={{borderBottom:'2px solid #e5e7eb',paddingBottom:'5px',color:'#374151'}}>{d}</h3>
                                            <div style={{display:'flex',gap:'10px',flexWrap:'wrap',marginTop:'10px'}}>
                                                {daySlots.map(s => (
                                                    <div key={s.id} style={{border:'1px solid #d1d5db',borderRadius:'6px',padding:'10px',minWidth:'200px',background:'#f9fafb',position:'relative'}}>
                                                        <button onClick={()=>del(s.id)} style={{position:'absolute',top:'5px',right:'5px',background:'none',border:'none',color:'#ef4444',cursor:'pointer'}}>×</button>
                                                        <div style={{fontWeight:'bold',color:'#111827'}}>{s.subject}</div>
                                                        <div style={{fontSize:'12px',color:'#6b7280'}}>{s.start_time} - {s.end_time}</div>
                                                        <div style={{fontSize:'13px',marginTop:'5px'}}>👨‍🏫 {s.teacher_name || 'TBA'}</div>
                                                        <div style={{fontSize:'13px'}}>📍 Room {s.room_no || 'TBA'}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
