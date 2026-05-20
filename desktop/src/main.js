import { createApp } from 'vue';
import App from './App.vue';
import './style.css';
import { installI18n } from './i18n/index.js';
import { initTheme } from './theme.js';

initTheme();

const app = createApp(App);
installI18n(app);
app.mount('#app');
