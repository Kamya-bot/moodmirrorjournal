import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.moodmirror',
  appName: 'MoodMirror',
  webDir: 'dist',
  server: {
    url: 'https://3823a692-3516-44c7-88f2-bbce12e9a563.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
