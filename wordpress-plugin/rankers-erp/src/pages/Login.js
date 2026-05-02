import { useState } from '@wordpress/element';
import { api, setToken } from '../api/client';

export default function Login({ onLogin }) {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const handleSubmit = async e => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            setToken(data.token);
            onLogin(data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="rp-login-wrap">
            <div className="rp-login-card">
                <div className="rp-login-logo">
                    <span className="rp-login-logo-icon">R</span>
                    <h1>Rankers ERP</h1>
                    <p>Institutional Management System</p>
                </div>
                <form onSubmit={handleSubmit} className="rp-login-form">
                    {error && <div className="rp-alert rp-alert-error">{error}</div>}
                    <div className="rp-field">
                        <label>Email</label>
                        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@rankers.com" required />
                    </div>
                    <div className="rp-field">
                        <label>Password</label>
                        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
                    </div>
                    <button type="submit" className="rp-btn rp-btn-primary rp-btn-full" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
