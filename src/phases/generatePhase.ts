import mysql from 'mysql2/promise';
import { TdgConfig } from '../config/config.types';
import { SeedContext } from './seedPhase';
import { batchInsert } from '../db/batchWriter';
import {
  generateOrdersAndDetails,
  ORDER_COLUMNS,
  ORDER_DETAIL_COLUMNS,
  PAYMENT_COLUMNS,
  orderToRow,
  orderDetailToRow,
  paymentToRow,
} from '../generators/orderGenerator';
import { logger } from '../utils/logger';

export async function generatePhase(
  pool: mysql.Pool,
  config: TdgConfig,
  ctx: SeedContext
): Promise<void> {
  logger.info('════════════════════════════════════════════════');
  logger.info('PHASE 3: GENERATE — Creating orders, details & payments');
  logger.info('════════════════════════════════════════════════');

  const { generate, validity, seed, batch_size } = config;

  logger.info(
    `→ Generating ${ctx.customerNumbers.length * generate.orders_per_customer} orders ` +
      `(${generate.orders_per_customer} per customer)...`
  );

  const { orders, orderDetails, payments } = generateOrdersAndDetails(
    ctx.customerNumbers,
    ctx.productCodes,
    generate.orders_per_customer,
    generate.order_details_per_order,
    validity.orders,
    seed.faker_seed
  );

  logger.info(
    `  ✓ Generated: ${orders.length} orders | ` +
      `${orderDetails.length} order details | ` +
      `${payments.length} payments\n`
  );

  logger.info('→ Inserting orders...');
  await batchInsert(pool, 'orders', ORDER_COLUMNS, orders.map(orderToRow), batch_size);
  logger.info('  ✓ Orders inserted\n');

  logger.info('→ Inserting order details...');
  await batchInsert(pool, 'orderdetails', ORDER_DETAIL_COLUMNS, orderDetails.map(orderDetailToRow), batch_size);
  logger.info('  ✓ Order details inserted\n');

  logger.info('→ Inserting payments...');
  await batchInsert(pool, 'payments', PAYMENT_COLUMNS, payments.map(paymentToRow), batch_size);
  logger.info('  ✓ Payments inserted\n');

  logger.info('PHASE 3 COMPLETE\n');
}
