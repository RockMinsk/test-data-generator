import mysql from 'mysql2/promise';
import { logger } from '../utils/logger';

// Tables in reverse FK dependency order (children before parents)
const TABLES_TO_TRUNCATE = [
  'payments',
  'orderdetails',
  'orders',
  'customers',
  'products',
  'productlines',
  'employees',
  'offices',
];

export async function resetPhase(pool: mysql.Pool): Promise<void> {
  logger.info('════════════════════════════════════════════════');
  logger.info('PHASE 1: RESET — Truncating all tables');
  logger.info('════════════════════════════════════════════════');

  const conn = await pool.getConnection();
  try {
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');

    for (const table of TABLES_TO_TRUNCATE) {
      await conn.execute(`TRUNCATE TABLE \`${table}\``);
      logger.info(`  ✓ Truncated: ${table}`);
    }

    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
  } finally {
    conn.release();
  }

  logger.info('PHASE 1 COMPLETE\n');
}
