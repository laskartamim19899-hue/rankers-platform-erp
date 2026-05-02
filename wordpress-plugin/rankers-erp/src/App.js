import { useState, useEffect } from '@wordpress/element';
import { api, getToken } from './api/client';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Finance from './pages/Finance';
import Academic from './pages/Academic';
import Attendance from './pages/Attendance';
import Admissions from './pages/Admissions';
import Reports from './pages/Reports';
import Expenses from './pages/Expenses';
import Salary from './pages/Salary';
import Staff from './pages/Staff';
import Hostel from './pages/Hostel';
import Inventory from './pages/Inventory';
import Leave from './pages/Leave';
import Timetable from './pages/Timetable';
import Announcements from './pages/Announcements';
import Inquiries from './pages/Inquiries';
import GuestTeachers from './pages/GuestTeachers';
import Settings from './pages/Settings';
import Login from './pages/Login';

const PAGE_MAP = {
    dashboard: Dashboard,
    students: Students,
    finance: Finance,
    academic: Academic,
    attendance: Attendance,
    admissions: Admissions,
    reports: Reports,
    expenses: Expenses,
    salary: Salary,
    staff: Staff,
    hostel: Hostel,
    inventory: Inventory,
    leave: Leave,
    timetable: Timetable,
    announcements: Announcements,
    inquiries: Inquiries,
    guest: GuestTeachers,
    settings: Settings,
};

export default function App() {
    const rootEl     = document.getElementById('rankers-erp-root');
    const initialPage= rootEl?.getAttribute('data-page') || 'dashboard';
    const [page, setPage]   = useState(initialPage);
    const [user, setUser]   = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getToken();
        if (token) {
            api.get('/auth/me').then(r => setUser(r.data)).catch(() => localStorage.removeItem('rankers_token')).finally(() => setLoading(false));
        } else { setLoading(false); }
    }, []);

    // Listen to WP admin menu clicks
    useEffect(() => {
        const links = document.querySelectorAll('a[href*="rankers-erp"]');
        links.forEach(link => {
            link.addEventListener('click', e => {
                const match = link.href.match(/page=([^&]+)/);
                if (match) {
                    e.preventDefault();
                    const map = { 'rankers-erp':'dashboard','rankers-erp-students':'students','rankers-erp-finance':'finance','rankers-erp-academic':'academic','rankers-erp-attendance':'attendance','rankers-erp-admissions':'admissions','rankers-erp-reports':'reports','rankers-erp-expenses':'expenses','rankers-erp-salary':'salary','rankers-erp-staff':'staff','rankers-erp-hostel':'hostel','rankers-erp-inventory':'inventory','rankers-erp-leave':'leave','rankers-erp-timetable':'timetable','rankers-erp-announcements':'announcements','rankers-erp-inquiries':'inquiries','rankers-erp-guest':'guest','rankers-erp-settings':'settings' };
                    setPage(map[match[1]] || 'dashboard');
                }
            });
        });
    }, []);

    if (loading) return <div className="rp-loading"><div className="rp-spinner" /><span>Loading...</span></div>;
    if (!user)   return <Login onLogin={setUser} />;

    const PageComponent = PAGE_MAP[page] || Dashboard;

    return (
        <div className="rp-shell">
            <Sidebar page={page} setPage={setPage} user={user} onLogout={() => { localStorage.removeItem('rankers_token'); setUser(null); }} />
            <main className="rp-main">
                <PageComponent user={user} />
            </main>
        </div>
    );
}
