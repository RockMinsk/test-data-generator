import { faker } from '@faker-js/faker';
import { truncate, COL } from '../utils/truncate';

export interface Product {
  productCode: string;
  productName: string;
  productLine: string;
  productScale: string;
  productVendor: string;
  productDescription: string;
  quantityInStock: number;
  buyPrice: number;
  msrp: number;
}

const PRODUCT_SCALES = ['1:10', '1:12', '1:18', '1:24', '1:32', '1:50', '1:72'];

export const PRODUCT_COLUMNS = [
  'productCode',
  'productName',
  'productLine',
  'productScale',
  'productVendor',
  'productDescription',
  'quantityInStock',
  'buyPrice',
  'MSRP',
];

export function generateProducts(
  productLines: string[],
  productsPerLine: number,
  seed: number
): Product[] {
  faker.seed(seed + 3);
  const products: Product[] = [];

  for (const productLine of productLines) {
    const lineIndex = productLine.replace('ProductLine-', 'P');
    for (let p = 1; p <= productsPerLine; p++) {
      const rawCode = `${lineIndex}-${String(p).padStart(4, '0')}`;
      const buyPrice = parseFloat(
        faker.finance.amount({ min: 10, max: 200, dec: 2 })
      );
      const markup = faker.number.float({ min: 0.1, max: 1.0, fractionDigits: 2 });
      const msrp = parseFloat((buyPrice * (1 + markup)).toFixed(2));

      products.push({
        productCode: truncate(rawCode, COL.productCode),
        productName: truncate(faker.commerce.productName(), COL.productName),
        productLine,
        productScale: truncate(faker.helpers.arrayElement(PRODUCT_SCALES), COL.productScale),
        productVendor: truncate(faker.company.name(), COL.productVendor),
        productDescription: faker.lorem.paragraph(), // TEXT — no limit
        quantityInStock: faker.number.int({ min: 0, max: 9999 }), // smallint max 32767
        buyPrice,
        msrp,
      });
    }
  }

  return products;
}

export function productToRow(p: Product): unknown[] {
  return [
    p.productCode,
    p.productName,
    p.productLine,
    p.productScale,
    p.productVendor,
    p.productDescription,
    p.quantityInStock,
    p.buyPrice,
    p.msrp,
  ];
}
