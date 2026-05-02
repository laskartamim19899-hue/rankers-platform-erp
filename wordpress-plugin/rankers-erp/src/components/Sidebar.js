import { useState, useEffect } from '@wordpress/element';
import { api } from '../api/client';

export default function Sidebar({ page, setPage, user, onLogout }) {
    
    const canSee = (mod) => {
        if (!user || !user.roles) return false;
        if (user.roles.includes('rankers_super_admin') || user.roles.includes('administrator')) return true;
        // Basic role checks based on the module
        if (user.roles.includes('rankers_student')) return ['dashboard', 'announcements'].includes(mod);
        if (user.roles.includes('rankers_teacher')) return ['dashboard', 'academic', 'attendance', 'students'].includes(mod);
        if (user.roles.includes('rankers_accountant')) return ['dashboard', 'finance', 'expenses', 'salary', 'reports'].includes(mod);
        if (user.roles.includes('rankers_admin')) return true;
        return true;
    };

    const menu = [
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'students',  icon: '👨‍🎓', label: 'Students' },
        { id: 'finance',   icon: '💰', label: 'Finance' },
        { id: 'academic',  icon: '📚', label: 'Academic' },
        { id: 'attendance',icon: '📅', label: 'Attendance' },
        { id: 'reports',   icon: '📈', label: 'Reports' },
        { id: 'expenses',  icon: '💸', label: 'Expenses' },
        { id: 'salary',    icon: '💼', label: 'Salary' },
        { id: 'staff',     icon: '👨‍🏫', label: 'Staff' },
        { id: 'hostel',    icon: '🏠', label: 'Hostel' },
        { id: 'inventory', icon: '📦', label: 'Inventory' },
        { id: 'leave',     icon: '🎟️', label: 'Leave' },
        { id: 'timetable', icon: '⏰', label: 'Timetable' },
        { id: 'announcements',icon:'📢', label: 'Announcements' },
        { id: 'inquiries', icon: '📞', label: 'Inquiries' },
        { id: 'guest',     icon: '🤝', label: 'Guest Teachers' },
        { id: 'settings',  icon: '⚙️', label: 'Settings' },
    ];

    return (
        <aside className="rp-sidebar">
            <div className="rp-sidebar-header">
                <h2>Rankers ERP</h2>
                <div className="rp-user-info">
                    <div className="rp-avatar">{user?.name?.charAt(0) || 'U'}</div>
                    <div>
                        <div className="rp-user-name">{user?.name}</div>
                        <div className="rp-user-role">{user?.role}</div>
                    </div>
                </div>
            </div>
            <nav className="rp-nav">
                {menu.filter(m => canSee(m.id)).map(item => (
                    <button 
                        key={item.id} 
                        className={`rp-nav-item ${page === item.id ? 'active' : ''}`}
                        onClick={() => setPage(item.id)}
                    >
                        <span className="rp-nav-icon">{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>
            <div className="rp-sidebar-footer">
                <button className="rp-nav-item" onClick={onLogout} style={{color:'#ef4444'}}>
                    <span className="rp-nav-icon">🚪</span> Logout
                </button>
            </div>
        </aside>
    );
}
