import { render } from '@wordpress/element';
import App from './App';
import './index.css';

const root = document.getElementById('rankers-erp-root');
if (root) {
    render(<App />, root);
}
