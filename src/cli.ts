import * as fs from 'fs';
import * as path from 'path';
import { getPool, closePool } from './db/connection';
import { TdgConfig } from './config/config.types';
import { resetPhase } from './phases/resetPhase';
import { seedPhase } from './phases/seedPhase';
import { generatePhase } from './phases/generatePhase';
import { logger, logFilePath } from './utils/logger';

async function loadConfig(configPath: string): Promise<TdgConfig> {
  const resolved = path.resolve(configPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Config file not found: ${resolved}`);
  }
  const raw = fs.readFileSync(resolved, 'utf-8');
  return JSON.parse(raw) as TdgConfig;
}

async function main(): Promise<void> {
  const configArg = process.argv[2] || 'config.json';
  logger.info(`╔══════════════════════════════════════════════╗`);
  logger.info(`║        TDG — Test Data Generator POC         ║`);
  logger.info(`║           Company X / classicmodels          ║`);
  logger.info(`╚══════════════════════════════════════════════╝`);
  logger.info(`Log file: ${logFilePath}`);
  logger.info(`Loading config: ${configArg}\n`);

  let config: TdgConfig;
  try {
    config = await loadConfig(configArg);
  } catch (err) {
    logger.error(`Failed to load config: ${(err as Error).message}`);
    process.exit(1);
  }

  const pool = getPool(config.db);
  const startTime = Date.now();

  try {
    await resetPhase(pool);
    const seedContext = await seedPhase(pool, config);
    await generatePhase(pool, config, seedContext);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.info(`╔═══════════════════════════════════════════════╗`);
    logger.info(`║  ✅  TDG run completed in ${elapsed}s`.padEnd(47) + `║`);
    logger.info(`╚═══════════════════════════════════════════════╝`);
  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.error(`TDG run FAILED after ${elapsed}s — ${(err as Error).message}`);
    process.exit(1);
  } finally {
    await closePool();
  }
}

main();
