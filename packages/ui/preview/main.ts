import { mount } from 'svelte';
import '@svelocity/ui/tokens.css';
import Preview from './Preview.svelte';

mount(Preview, { target: document.getElementById('app')! });
