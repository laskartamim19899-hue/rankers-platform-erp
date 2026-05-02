import { useState, useEffect } from '@wordpress/element';
import { api } from '../api/client';

export default function Admissions() {
    return (
        <div className="rp-page">
            <div className="rp-page-header">
                <div><h1>Admissions</h1><p>Public admission requests</p></div>
            </div>
            <div className="rp-card" style={{padding:'40px',textAlign:'center'}}>
                <p>Public admissions frontend is managed via shortcode. <br/><br/>Use <code>[rankers_admission_form]</code> on any WordPress page.</p>
                <p>To approve registered students, go to the <strong>Students</strong> module and select "Pending Approval".</p>
            </div>
        </div>
    );
}
