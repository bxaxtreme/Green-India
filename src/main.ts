import './styles.css';
import { renderApp } from './ui/app';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('App root element #app was not found.');
renderApp(root);