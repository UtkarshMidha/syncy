import { writeFile } from 'node:fs/promises';

const names = ['SYNCY_SUPABASE_URL', 'SYNCY_SUPABASE_ANON_KEY'];
const values = Object.fromEntries(names.map(name => [name, process.env[name]?.trim()]));
const missing = names.filter(name => !values[name]);
if (missing.length) throw new Error(`Missing required Vercel environment variables: ${missing.join(', ')}`);

const url = new URL(values.SYNCY_SUPABASE_URL);
if (url.protocol !== 'https:') throw new Error('SYNCY_SUPABASE_URL must use HTTPS.');

const config = {
  supabaseUrl: url.origin,
  supabaseAnonKey: values.SYNCY_SUPABASE_ANON_KEY,
};

await writeFile(new URL('../prototype/config.js', import.meta.url), `window.SYNCY_CONFIG = ${JSON.stringify(config)};\n`);
console.log('Generated prototype/config.js for the Vercel static deployment.');
