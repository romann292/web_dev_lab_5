export * from './task5/main.js';
import { runTask5 } from './task5/main.js';
import { fileURLToPath } from 'url';

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runTask5();
}
