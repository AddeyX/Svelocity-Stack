import { mount } from 'svelte';
import '@svelocity/theme/tokens.css';
import '@svelocity/theme/platform/desktop.css';
import App from './App.svelte';

mount(App, { target: document.getElementById('app')! });
