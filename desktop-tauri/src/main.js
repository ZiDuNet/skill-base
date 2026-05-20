import { createApp } from 'vue';
import App from '@desktop/App.vue';
import '@desktop/style.css';
import { installI18n } from '@desktop/i18n/index.js';
import { initTheme } from '@desktop/theme.js';
import { installSkb } from './skb.js';

initTheme();
installSkb();

const app = createApp(App);
installI18n(app);
app.mount('#app');
