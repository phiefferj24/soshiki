import { readFileSync } from 'fs';
import { join } from 'path';
import type { Manifest } from 'soshiki-types';

const cwd = join(__filename, '..', '..', '..');

let manifest = JSON.parse(readFileSync(join(cwd, "manifest.json"), 'utf8')) as Manifest;
export default manifest;