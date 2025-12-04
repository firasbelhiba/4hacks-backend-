import * as dotenv from 'dotenv';
import { join } from 'path';

// Load .env.test
dotenv.config({ path: join(__dirname, '../.env.test.local') });
