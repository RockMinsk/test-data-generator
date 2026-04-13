import * as path from 'path';
import { createLogger, format, transports, Logger } from 'winston';

const { combine, timestamp, printf, errors } = format;

// ─── ANSI colour codes (applied manually inside printf) ───────────────────────

const COLORS: Record<string, string> = {
  info:  '\x1b[32m', // green
  warn:  '\x1b[33m', // yellow
  error: '\x1b[31m', // red
};
const RESET = '\x1b[39m';

// ─── Console format — level tag coloured, message uncoloured ──────────────────

const consoleLineFormat = printf(({ level, message, timestamp: ts, stack }) => {
  const color = COLORS[level] || '';
  const tag = level.toUpperCase();
  const line = `${ts}  [${color}${tag}${RESET}]  ${message}`;
  return stack ? `${line}\n${stack}` : line;
});

// ─── File format — plain text, no ANSI codes ─────────────────────────────────

const fileLineFormat = printf(({ level, message, timestamp: ts, stack }) => {
  const tag = level.toUpperCase();
  const line = `${ts}  [${tag}]  ${message}`;
  return stack ? `${line}\n${stack}` : line;
});

// ─── Log file path ────────────────────────────────────────────────────────────

const runTimestamp = new Date()
  .toISOString()
  .replace(/[:.]/g, '-')
  .replace('T', '_')
  .slice(0, 19);

const logsDir = path.resolve(process.cwd(), 'logs');
if (!require('fs').existsSync(logsDir)) {
  require('fs').mkdirSync(logsDir, { recursive: true });
}
const logFilePath = path.resolve(logsDir, `tdg-run-${runTimestamp}.log`);

// ─── Logger instance ──────────────────────────────────────────────────────────

const winstonLogger: Logger = createLogger({
  level: (process.env.LOG_LEVEL || 'info').toLowerCase(),
  exitOnError: false,
  transports: [
    // Console — coloured level tag only
    new transports.Console({
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        consoleLineFormat
      ),
    }),

    // File — plain text, one log per run
    new transports.File({
      filename: logFilePath,
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        fileLineFormat
      ),
    }),
  ],
});

// ─── Public API (matches existing logger interface) ───────────────────────────

export const logger = {
  info:  (msg: string): void => { winstonLogger.info(msg); },
  warn:  (msg: string): void => { winstonLogger.warn(msg); },
  error: (msg: string): void => { winstonLogger.error(msg); },
};

export { logFilePath };
