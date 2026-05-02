<?php if ( ! defined( 'ABSPATH' ) ) exit; ?>
<div id="rankers-erp-root" data-page="<?php echo esc_attr( $current ); ?>">
    <div style="display:flex;align-items:center;justify-content:center;height:400px;font-family:system-ui;flex-direction:column;gap:16px;color:#6b7280;">
        <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color:#7c3aed;opacity:.6;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        <p style="margin:0;font-size:15px;font-weight:500;">Loading Rankers ERP...</p>
        <p style="margin:0;font-size:12px;opacity:.7;">If this persists, ensure the plugin assets are built: <code>npm run build</code></p>
    </div>
</div>
