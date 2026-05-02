import { useState, useEffect } from '@wordpress/element';
import { api } from '../api/client';

export default function Academic() {
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('courses'); // courses | batches
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);

    const loadData = () => {
        setLoading(true);
        Promise.all([
            api.get('/academic/courses').then(r => setCourses(r.data)),
            api.get('/academic/batches').then(r => setBatches(r.data))
        ]).finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (tab === 'courses') {
                await api.post('/academic/courses', form);
            } else {
                await api.post('/academic/batches', form);
            }
            setShowForm(false);
            setForm({});
            loadData();
        } catch(err) {
            alert('Error saving data');
        } finally {
            setSaving(false);
        }
    };

    const deleteCourse = async (id) => {
        if(!confirm('Are you sure? This will delete associated batches.')) return;
        await api.delete(`/academic/courses/${id}`);
        loadData();
    };

    return (
        <div className="rp-page">
            <div className="rp-page-header">
                <div><h1>Academic</h1><p>Manage courses and batches</p></div>
                <button className="rp-btn rp-btn-primary" onClick={() => {setShowForm(true); setForm({});}}>
                    + Add {tab === 'courses' ? 'Course' : 'Batch'}
                </button>
            </div>

            {showForm && (
                <div className="rp-card rp-mb">
                    <div className="rp-card-header"><h2>New {tab === 'courses' ? 'Course' : 'Batch'}</h2></div>
                    <form onSubmit={submit} className="rp-form-grid">
                        {tab === 'courses' ? (
                            <>
                                <div className="rp-field"><label>Course Name</label><input required value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} /></div>
                                <div className="rp-field"><label>Duration</label><input required value={form.duration||''} onChange={e=>setForm({...form,duration:e.target.value})} /></div>
                                <div className="rp-field rp-col-2"><label>Description</label><textarea value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})} /></div>
                            </>
                        ) : (
                            <>
                                <div className="rp-field"><label>Batch Name</label><input required value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} /></div>
                                <div className="rp-field"><label>Course</label>
                                    <select required value={form.courseId||''} onChange={e=>setForm({...form,courseId:e.target.value})}>
                                        <option value="">Select Course...</option>
                                        {courses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </>
                        )}
                        <div className="rp-form-actions rp-col-2">
                            <button type="submit" className="rp-btn rp-btn-primary" disabled={saving}>{saving?'Saving...':'Save'}</button>
                            <button type="button" className="rp-btn" onClick={()=>setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="rp-card">
                <div className="rp-card-toolbar">
                    <div className="rp-tabs">
                        <button className={`rp-tab${tab==='courses'?' active':''}`} onClick={()=>setTab('courses')}>Courses</button>
                        <button className={`rp-tab${tab==='batches'?' active':''}`} onClick={()=>setTab('batches')}>Batches</button>
                    </div>
                </div>

                {loading ? <div className="rp-loading"><div className="rp-spinner"/></div> : (
                    <div className="rp-table-wrap">
                        {tab === 'courses' ? (
                            <table className="rp-table">
                                <thead><tr><th>Course Name</th><th>Duration</th><th>Students</th><th>Batches</th><th>Action</th></tr></thead>
                                <tbody>
                                    {courses.map(c => (
                                        <tr key={c.id}>
                                            <td><strong>{c.name}</strong></td>
                                            <td>{c.duration}</td>
                                            <td>{c.student_count}</td>
                                            <td>{c.batches?.length || 0}</td>
                                            <td><button className="rp-btn rp-btn-sm rp-btn-danger" onClick={()=>deleteCourse(c.id)}>Delete</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table className="rp-table">
                                <thead><tr><th>Batch Name</th><th>Course</th><th>Teacher</th><th>Students</th></tr></thead>
                                <tbody>
                                    {batches.map(b => (
                                        <tr key={b.id}>
                                            <td><strong>{b.name}</strong></td>
                                            <td>{b.course_name}</td>
                                            <td>{b.teacher_name || 'Unassigned'}</td>
                                            <td>{b.student_count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
