import { mount } from 'svelte';
import '@svelocity/theme/tokens.css';
import Preview from './Preview.svelte';

mount(Preview, { target: document.getElementById('app')! });
