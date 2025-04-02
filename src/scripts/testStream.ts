// src/scripts/testStream.ts
import { startStream } from '../lib/startStream';

startStream((data) => {
  console.log('[STREAM]', data);
});
