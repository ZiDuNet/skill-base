import { DESKTOP_IPC_CHANNELS } from '../../cli/lib/desktop-ipc-channels.mjs';
import { invoke } from '@tauri-apps/api/core';

const skb = {
  invoke(channel, ...args) {
    if (!DESKTOP_IPC_CHANNELS.includes(channel)) {
      return Promise.reject(new Error(`Invalid IPC channel: ${channel}`));
    }
    return invoke('skb_invoke', { channel, args });
  }
};

export function installSkb() {
  window.skb = skb;
}

export { skb };
