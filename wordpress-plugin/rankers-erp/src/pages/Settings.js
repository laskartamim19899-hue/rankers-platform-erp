import { useState, useEffect } from '@wordpress/element';
import { api } from '../api/client';

export default function Settings() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        api.get('/settings').then(r => setSettings(r.data)).finally(() => setLoading(false));
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true); setMsg('');
        try {
            await api.put('/settings', settings);
            setMsg('Settings updated successfully!');
        } catch(err) {
            setMsg('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="rp-loading"><div className="rp-spinner"/></div>;

    return (
        <div className="rp-page">
            <div className="rp-page-header">
                <div><h1>Institution Settings</h1><p>Configure global system settings</p></div>
            </div>

            {msg && <div className={`rp-alert ${msg.includes('Error') ? 'rp-alert-error' : 'rp-alert-success'}`}>{msg}</div>}

            <div className="rp-card">
                <div className="rp-card-header"><h2>General Settings</h2></div>
                <form onSubmit={submit} className="rp-form-grid" style={{padding:'20px'}}>
                    <div className="rp-field"><label>Institution Name</label><input required value={settings.institutionName||''} onChange={e=>setSettings({...settings,institutionName:e.target.value})} /></div>
                    <div className="rp-field"><label>Tagline</label><input value={settings.tagline||''} onChange={e=>setSettings({...settings,tagline:e.target.value})} /></div>
                    <div className="rp-field"><label>Principal Name</label><input value={settings.principalName||''} onChange={e=>setSettings({...settings,principalName:e.target.value})} /></div>
                    <div className="rp-field"><label>Phone</label><input value={settings.phone||''} onChange={e=>setSettings({...settings,phone:e.target.value})} /></div>
                    <div className="rp-field"><label>Email</label><input type="email" value={settings.email||''} onChange={e=>setSettings({...settings,email:e.target.value})} /></div>
                    <div className="rp-field"><label>Website</label><input value={settings.website||''} onChange={e=>setSettings({...settings,website:e.target.value})} /></div>
                    <div className="rp-field rp-col-2"><label>Address</label><textarea value={settings.address||''} onChange={e=>setSettings({...settings,address:e.target.value})} /></div>
                    <div className="rp-field"><label>GST Number</label><input value={settings.gstNumber||''} onChange={e=>setSettings({...settings,gstNumber:e.target.value})} /></div>
                    
                    <div className="rp-field rp-col-2" style={{marginTop:'20px'}}><h3>Financial Settings</h3><hr/></div>
                    
                    <div className="rp-field rp-checkbox-field rp-col-2">
                        <label><input type="checkbox" checked={settings.lateFeeEnabled} onChange={e=>setSettings({...settings,lateFeeEnabled:e.target.checked})} /> Enable automatic late fee calculation</label>
                    </div>
                    {settings.lateFeeEnabled && (
                        <>
                            <div className="rp-field"><label>Late Fee Per Day (₹)</label><input type="number" value={settings.lateFeePerDay} onChange={e=>setSettings({...settings,lateFeePerDay:parseFloat(e.target.value)})} /></div>
                            <div className="rp-field"><label>Grace Period (Days)</label><input type="number" value={settings.gracePeriodDays} onChange={e=>setSettings({...settings,gracePeriodDays:parseInt(e.target.value)})} /></div>
                        </>
                    )}
                    
                    <div className="rp-form-actions rp-col-2">
                        <button type="submit" className="rp-btn rp-btn-primary" disabled={saving}>{saving?'Saving...':'Save Settings'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
