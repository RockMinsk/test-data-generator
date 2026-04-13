import { faker } from '@faker-js/faker';
import { truncate, COL } from '../utils/truncate';

export interface ProductLine {
  productLine: string;
  textDescription: string;
  htmlDescription: string | null;
  image: string | null;
}

export const PRODUCT_LINE_COLUMNS = [
  'productLine',
  'textDescription',
  'htmlDescription',
  'image',
];

export function generateProductLines(count: number, seed: number): ProductLine[] {
  faker.seed(seed + 2);
  const productLines: ProductLine[] = [];

  for (let i = 1; i <= count; i++) {
    productLines.push({
      productLine: truncate(`ProductLine-${i}`, COL.productLine),
      textDescription: truncate(
        `${faker.commerce.department()} — ${faker.lorem.sentence()}`,
        4000 // textDescription varchar(4000)
      ),
      htmlDescription: null,
      image: null,
    });
  }

  return productLines;
}

export function productLineToRow(pl: ProductLine): unknown[] {
  return [pl.productLine, pl.textDescription, pl.htmlDescription, pl.image];
}
