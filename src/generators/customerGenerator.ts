import { faker } from '@faker-js/faker';
import { truncate, COL } from '../utils/truncate';

export interface Customer {
  customerNumber: number;
  customerName: string;
  contactLastName: string;
  contactFirstName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
  salesRepEmployeeNumber: number | null;
  creditLimit: number;
}

export const CUSTOMER_COLUMNS = [
  'customerNumber',
  'customerName',
  'contactLastName',
  'contactFirstName',
  'phone',
  'addressLine1',
  'addressLine2',
  'city',
  'state',
  'postalCode',
  'country',
  'salesRepEmployeeNumber',
  'creditLimit',
];

export function generateCustomers(
  count: number,
  salesRepNumbers: number[],
  seed: number
): Customer[] {
  faker.seed(seed + 4);
  const customers: Customer[] = [];

  for (let i = 1; i <= count; i++) {
    customers.push({
      customerNumber: i,
      customerName: truncate(faker.company.name(), COL.customerName),
      contactLastName: truncate(faker.person.lastName(), COL.contactLastName),
      contactFirstName: truncate(faker.person.firstName(), COL.contactFirstName),
      phone: truncate(faker.phone.number(), COL.phone),
      addressLine1: truncate(faker.location.streetAddress(), COL.addressLine1),
      addressLine2: truncate(
        faker.datatype.boolean(0.2) ? faker.location.secondaryAddress() : null,
        COL.addressLine2
      ),
      city: truncate(faker.location.city(), COL.city),
      state: truncate(faker.location.state({ abbreviated: true }), COL.state),
      postalCode: truncate(faker.location.zipCode(), COL.postalCode),
      country: truncate(faker.location.country(), COL.country),
      salesRepEmployeeNumber: faker.helpers.arrayElement(salesRepNumbers),
      creditLimit: parseFloat(
        faker.finance.amount({ min: 0, max: 200000, dec: 2 })
      ),
    });
  }

  return customers;
}

export function customerToRow(c: Customer): unknown[] {
  return [
    c.customerNumber,
    c.customerName,
    c.contactLastName,
    c.contactFirstName,
    c.phone,
    c.addressLine1,
    c.addressLine2,
    c.city,
    c.state,
    c.postalCode,
    c.country,
    c.salesRepEmployeeNumber,
    c.creditLimit,
  ];
}
