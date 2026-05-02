import { useState, useEffect } from '@wordpress/element';
import { api } from '../api/client';

export default function Attendance() {
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        api.get('/academic/batches').then(r => {
            setBatches(r.data);
            if (r.data.length > 0) setSelectedBatch(r.data[0].id);
        });
    }, []);

    useEffect(() => {
        if (!selectedBatch) return;
        setLoading(true);
        // Load all students for this batch
        Promise.all([
            api.get('/students'),
            api.get(`/attendance/batch/${selectedBatch}?date=${date}`)
        ]).then(([studentsRes, attRes]) => {
            const batchStudents = studentsRes.data.filter(s => s.courses?.some(c => c.batch?.id === selectedBatch));
            
            // Map existing attendance
            const attMap = {};
            attRes.data.forEach(a => { attMap[a.student_id] = a.status; });
            
            const records = batchStudents.map(s => ({
                id: s.id,
                name: s.user?.name,
                regNo: s.regNo,
                status: attMap[s.id] || 'PRESENT'
            }));
            
            setStudents(records);
        }).finally(() => setLoading(false));
    }, [selectedBatch, date]);

    const handleStatusChange = (studentId, status) => {
        setStudents(students.map(s => s.id === studentId ? { ...s, status } : s));
    };

    const submit = async () => {
        setSaving(true); setMsg('');
        const records = students.map(s => ({
            studentId: s.id,
            batchId: selectedBatch,
            date: date,
            status: s.status
        }));
        try {
            await api.post('/attendance', { records });
            setMsg('Attendance saved successfully');
        } catch(err) {
            setMsg('Error saving attendance');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rp-page">
            <div className="rp-page-header">
                <div><h1>Attendance</h1><p>Mark daily student attendance</p></div>
                <button className="rp-btn rp-btn-primary" onClick={submit} disabled={saving || students.length === 0}>
                    {saving ? 'Saving...' : 'Save Attendance'}
                </button>
            </div>

            {msg && <div className={`rp-alert ${msg.includes('Error') ? 'rp-alert-error' : 'rp-alert-success'}`}>{msg}</div>}

            <div className="rp-card">
                <div className="rp-card-toolbar" style={{display:'flex', gap:'15px', alignItems:'center'}}>
                    <div className="rp-field" style={{marginBottom:0, flex:1}}>
                        <label style={{display:'none'}}>Batch</label>
                        <select value={selectedBatch} onChange={e=>setSelectedBatch(e.target.value)}>
                            {batches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.course_name})</option>)}
                        </select>
                    </div>
                    <div className="rp-field" style={{marginBottom:0}}>
                        <label style={{display:'none'}}>Date</label>
                        <input type="date" value={date} onChange={e=>setDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
                    </div>
                </div>

                {loading ? <div className="rp-loading"><div className="rp-spinner"/></div> : (
                    <div className="rp-table-wrap">
                        <table className="rp-table">
                            <thead><tr><th>Student Name</th><th>Reg No</th><th>Status</th></tr></thead>
                            <tbody>
                                {students.length === 0 && <tr><td colSpan={3} style={{textAlign:'center',padding:'20px'}}>No students found in this batch.</td></tr>}
                                {students.map(s => (
                                    <tr key={s.id}>
                                        <td><strong>{s.name}</strong></td>
                                        <td><span className="rp-badge">{s.regNo || '—'}</span></td>
                                        <td>
                                            <div style={{display:'flex', gap:'10px'}}>
                                                <label style={{display:'flex',alignItems:'center',gap:'5px',cursor:'pointer',color:s.status==='PRESENT'?'#10b981':'inherit'}}>
                                                    <input type="radio" name={`status-${s.id}`} checked={s.status==='PRESENT'} onChange={()=>handleStatusChange(s.id, 'PRESENT')} /> Present
                                                </label>
                                                <label style={{display:'flex',alignItems:'center',gap:'5px',cursor:'pointer',color:s.status==='ABSENT'?'#ef4444':'inherit'}}>
                                                    <input type="radio" name={`status-${s.id}`} checked={s.status==='ABSENT'} onChange={()=>handleStatusChange(s.id, 'ABSENT')} /> Absent
                                                </label>
                                                <label style={{display:'flex',alignItems:'center',gap:'5px',cursor:'pointer',color:s.status==='LATE'?'#f59e0b':'inherit'}}>
                                                    <input type="radio" name={`status-${s.id}`} checked={s.status==='LATE'} onChange={()=>handleStatusChange(s.id, 'LATE')} /> Late
                                                </label>
                                            </div>
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
