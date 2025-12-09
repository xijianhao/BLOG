// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  server: {
    host: true, // 允许通过 IP 地址访问
    port: 4321, // 可选：指定端口号
  },
});
