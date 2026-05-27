import { createApp } from 'vue';
import App from '@desktop/App.vue';
import '@desktop/style.css';
import { installI18n } from '@desktop/i18n/index.js';
import { initTheme } from '@desktop/theme.js';
import { installSkb } from './skb.js';
import appLogoSrc from '../src-tauri/icons/128x128.png';

initTheme();
installSkb();

const app = createApp(App);
app.provide('appLogoSrc', appLogoSrc);
installI18n(app);
app.mount('#app');
