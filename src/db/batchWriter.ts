import mysql from 'mysql2/promise';
import { logger } from '../utils/logger';

export async function batchInsert(
  pool: mysql.Pool,
  table: string,
  columns: string[],
  rows: unknown[][],
  batchSize: number = 1000
): Promise<void> {
  if (rows.length === 0) {
    logger.warn(`  No rows to insert into [${table}], skipping.`);
    return;
  }

  const totalBatches = Math.ceil(rows.length / batchSize);
  logger.info(`Inserting ${rows.length} rows into [${table}] in ${totalBatches} batch(es) of ${batchSize}`);

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const placeholders = batch
      .map(() => `(${columns.map(() => '?').join(', ')})`)
      .join(', ');
    // Cast to any[] — mysql2 `execute` accepts OkPacket/ResultSet but its
    // typings are overly strict; the runtime handles any serialisable values.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const values: any[] = batch.flat();
    const sql = `INSERT INTO \`${table}\` (${columns.map((c) => `\`${c}\``).join(', ')}) VALUES ${placeholders}`;

    try {
      await pool.execute(sql, values);
      logger.info(`  Batch ${Math.floor(i / batchSize) + 1}/${totalBatches} → inserted ${batch.length} rows into [${table}]`);
    } catch (err) {
      logger.error(`  Failed batch insert into [${table}] at offset ${i}: ${(err as Error).message}`);
      throw err;
    }
  }
}
