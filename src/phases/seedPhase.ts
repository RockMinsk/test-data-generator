import mysql from 'mysql2/promise';
import { TdgConfig } from '../config/config.types';
import { batchInsert } from '../db/batchWriter';
import { generateOffices, officeToRow, OFFICE_COLUMNS } from '../generators/officeGenerator';
import { generateEmployees, employeeToRow, EMPLOYEE_COLUMNS } from '../generators/employeeGenerator';
import { generateProductLines, productLineToRow, PRODUCT_LINE_COLUMNS } from '../generators/productLineGenerator';
import { generateProducts, productToRow, PRODUCT_COLUMNS } from '../generators/productGenerator';
import { generateCustomers, customerToRow, CUSTOMER_COLUMNS } from '../generators/customerGenerator';
import { logger } from '../utils/logger';

export interface SeedContext {
  officeCodes: string[];
  employeeNumbers: number[];
  salesRepNumbers: number[];
  productCodes: string[];
  customerNumbers: number[];
}

export async function seedPhase(pool: mysql.Pool, config: TdgConfig): Promise<SeedContext> {
  logger.info('════════════════════════════════════════════════');
  logger.info('PHASE 2: SEED — Generating prerequisite data');
  logger.info('════════════════════════════════════════════════');

  const { seed, batch_size, validity } = config;

  // ── 1. Offices ──────────────────────────────────────────────────────────────
  logger.info('→ Generating offices...');
  const offices = generateOffices(seed.offices, seed.faker_seed);
  await batchInsert(pool, 'offices', OFFICE_COLUMNS, offices.map(officeToRow), batch_size);
  const officeCodes = offices.map((o) => o.officeCode);
  logger.info(`  ✓ ${offices.length} offices created\n`);

  // ── 2. Employees ─────────────────────────────────────────────────────────────
  logger.info('→ Generating employees...');
  const employees = generateEmployees(
    officeCodes,
    seed.employees_per_office,
    validity.employees,
    seed.faker_seed
  );
  await batchInsert(pool, 'employees', EMPLOYEE_COLUMNS, employees.map(employeeToRow), batch_size);
  const employeeNumbers = employees.map((e) => e.employeeNumber);
  const salesRepNumbers = employees
    .filter((e) => e.jobTitle === 'Sales Rep')
    .map((e) => e.employeeNumber);
  logger.info(`  ✓ ${employees.length} employees created (${salesRepNumbers.length} sales reps)\n`);

  // ── 3. Product Lines ─────────────────────────────────────────────────────────
  logger.info('→ Generating product lines...');
  const productLines = generateProductLines(seed.product_lines, seed.faker_seed);
  await batchInsert(pool, 'productlines', PRODUCT_LINE_COLUMNS, productLines.map(productLineToRow), batch_size);
  const productLineCodes = productLines.map((pl) => pl.productLine);
  logger.info(`  ✓ ${productLines.length} product lines created\n`);

  // ── 4. Products ──────────────────────────────────────────────────────────────
  logger.info('→ Generating products...');
  const products = generateProducts(productLineCodes, seed.products_per_line, seed.faker_seed);
  await batchInsert(pool, 'products', PRODUCT_COLUMNS, products.map(productToRow), batch_size);
  const productCodes = products.map((p) => p.productCode);
  logger.info(`  ✓ ${products.length} products created\n`);

  // ── 5. Customers ─────────────────────────────────────────────────────────────
  logger.info('→ Generating customers...');
  const customers = generateCustomers(seed.customers, salesRepNumbers, seed.faker_seed);
  await batchInsert(pool, 'customers', CUSTOMER_COLUMNS, customers.map(customerToRow), batch_size);
  const customerNumbers = customers.map((c) => c.customerNumber);
  logger.info(`  ✓ ${customers.length} customers created\n`);

  logger.info('PHASE 2 COMPLETE\n');

  return {
    officeCodes,
    employeeNumbers,
    salesRepNumbers,
    productCodes,
    customerNumbers,
  };
}
