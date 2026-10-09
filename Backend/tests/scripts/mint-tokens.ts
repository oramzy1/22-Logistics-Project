import fs from 'node:fs';
import path from 'node:path';
import { tokens } from '../helpers/auth';
import { env } from '../helpers/env';

const lines = [
  `BASE_URL=${env.baseUrl}`,
  `ADMIN_TOKEN=${tokens.admin}`,
  `USER_TOKEN=${tokens.user}`,
  `USER2_TOKEN=${tokens.userOther}`,
  `BUSINESS_TOKEN=${tokens.business}`,
  `DRIVER_TOKEN=${tokens.driver}`,
];

fs.writeFileSync(path.join(__dirname, '..', '.tokens.env'), lines.join('\n') + '\n');
console.log('Wrote tests/.tokens.env\n');
console.log(lines.map((l) => (l.includes('TOKEN') ? l.split('=')[0] + '=***' : l)).join('\n'));