/**
 * Must be the first import in main.tsx.
 * Aptos/Shelby browser bundles still reference Node's Buffer.
 */
import { Buffer } from 'buffer';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g: any = globalThis;
g.Buffer = Buffer;
g.global = g;
if (!g.process) g.process = { env: {} };
else if (!g.process.env) g.process.env = {};

export {};
