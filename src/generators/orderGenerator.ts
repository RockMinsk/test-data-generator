import { faker } from '@faker-js/faker';
import { OrderValidityRatio, OrderDetailsRange } from '../config/config.types';
import { selectByRatio } from '../validity/validityProfile';
import { truncate, COL } from '../utils/truncate';

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface Order {
  orderNumber: number;
  orderDate: Date;
  requiredDate: Date;
  shippedDate: Date | null;
  status: string;
  comments: string | null;
  customerNumber: number;
}

export interface OrderDetail {
  orderNumber: number;
  productCode: string;
  quantityOrdered: number;
  priceEach: number;
  orderLineNumber: number;
}

export interface Payment {
  customerNumber: number;
  checkNumber: string;
  paymentDate: Date;
  amount: number;
}

export interface OrderGenerationResult {
  orders: Order[];
  orderDetails: OrderDetail[];
  payments: Payment[];
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const ORDER_STATUSES = [
  'Shipped',
  'Resolved',
  'Cancelled',
  'On Hold',
  'Disputed',
  'In Process',
];

export const ORDER_COLUMNS = [
  'orderNumber',
  'orderDate',
  'requiredDate',
  'shippedDate',
  'status',
  'comments',
  'customerNumber',
];

export const ORDER_DETAIL_COLUMNS = [
  'orderNumber',
  'productCode',
  'quantityOrdered',
  'priceEach',
  'orderLineNumber',
];

export const PAYMENT_COLUMNS = [
  'customerNumber',
  'checkNumber',
  'paymentDate',
  'amount',
];

// ─── Row mappers ───────────────────────────────────────────────────────────────

export function orderToRow(o: Order): unknown[] {
  return [
    o.orderNumber,
    o.orderDate,
    o.requiredDate,
    o.shippedDate,
    o.status,
    o.comments,
    o.customerNumber,
  ];
}

export function orderDetailToRow(od: OrderDetail): unknown[] {
  return [
    od.orderNumber,
    od.productCode,
    od.quantityOrdered,
    od.priceEach,
    od.orderLineNumber,
  ];
}

export function paymentToRow(p: Payment): unknown[] {
  return [p.customerNumber, p.checkNumber, p.paymentDate, p.amount];
}

// ─── Generator ─────────────────────────────────────────────────────────────────

export function generateOrdersAndDetails(
  customerNumbers: number[],
  productCodes: string[],
  ordersPerCustomer: number,
  orderDetailsRange: OrderDetailsRange,
  validityRatios: OrderValidityRatio,
  seed: number
): OrderGenerationResult {
  faker.seed(seed + 5);

  const orders: Order[] = [];
  const orderDetails: OrderDetail[] = [];
  const payments: Payment[] = [];

  // Track used check numbers globally to ensure uniqueness
  const usedCheckNumbers = new Set<string>();
  let orderNumber = 10000;

  for (const customerNumber of customerNumbers) {
    for (let i = 0; i < ordersPerCustomer; i++) {
      // ── Order ──
      const orderDate = faker.date.between({
        from: '2022-01-01',
        to: '2025-12-31',
      });
      const daysRequired = faker.number.int({ min: 7, max: 30 });
      const requiredDate = new Date(
        orderDate.getTime() + daysRequired * 86_400_000
      );
      const isShipped = faker.datatype.boolean(0.7);
      const shippedDate = isShipped
        ? new Date(
            orderDate.getTime() +
              faker.number.int({ min: 1, max: 7 }) * 86_400_000
          )
        : null;

      const order: Order = {
        orderNumber,
        orderDate,
        requiredDate,
        shippedDate,
        status: truncate(faker.helpers.arrayElement(ORDER_STATUSES), COL.status),
        comments: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null, // TEXT — no limit
        customerNumber,
      };
      orders.push(order);

      // ── Order Details ──
      const detailCount = faker.number.int(orderDetailsRange);
      const usedProducts = new Set<string>();

      for (let lineNum = 1; lineNum <= detailCount; lineNum++) {
        let productCode: string;
        let attempts = 0;
        do {
          productCode = faker.helpers.arrayElement(productCodes);
          attempts++;
        } while (usedProducts.has(productCode) && attempts < 20);

        usedProducts.add(productCode);
        orderDetails.push({
          orderNumber,
          productCode,
          quantityOrdered: faker.number.int({ min: 1, max: 50 }),
          priceEach: parseFloat(
            faker.finance.amount({ min: 10, max: 500, dec: 2 })
          ),
          orderLineNumber: lineNum,
        });
      }

      // ── Payments ──
      const profile = selectByRatio(validityRatios);

      if (profile === 'with_payment') {
        let checkNumber: string;
        do {
          checkNumber = truncate(faker.string.alphanumeric(10).toUpperCase(), COL.checkNumber);
        } while (usedCheckNumbers.has(checkNumber));
        usedCheckNumbers.add(checkNumber);

        payments.push({
          customerNumber,
          checkNumber,
          paymentDate: new Date(
            orderDate.getTime() +
              faker.number.int({ min: 1, max: 15 }) * 86_400_000
          ),
          amount: parseFloat(
            faker.finance.amount({ min: 100, max: 10000, dec: 2 })
          ),
        });
      } else if (profile === 'with_multiple_payments') {
        const paymentCount = faker.number.int({ min: 2, max: 4 });
        for (let p = 0; p < paymentCount; p++) {
          let checkNumber: string;
          do {
            checkNumber = truncate(faker.string.alphanumeric(10).toUpperCase(), COL.checkNumber);
          } while (usedCheckNumbers.has(checkNumber));
          usedCheckNumbers.add(checkNumber);

          payments.push({
            customerNumber,
            checkNumber,
            paymentDate: new Date(
              orderDate.getTime() +
                faker.number.int({ min: 1, max: 30 }) * 86_400_000
            ),
            amount: parseFloat(
              faker.finance.amount({ min: 50, max: 5000, dec: 2 })
            ),
          });
        }
      }
      // 'without_payment' → intentionally no payment record

      orderNumber++;
    }
  }

  return { orders, orderDetails, payments };
}
