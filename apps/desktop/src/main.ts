import { mount } from 'svelte';
import '@svelocity/ui/tokens.css';
import '@svelocity/ui/tokens/platform/desktop.css';
import App from './App.svelte';

mount(App, { target: document.getElementById('app')! });
