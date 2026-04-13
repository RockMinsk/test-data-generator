import { faker } from '@faker-js/faker';
import { truncate, COL } from '../utils/truncate';

export interface Office {
  officeCode: string;
  city: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  state: string | null;
  country: string;
  postalCode: string;
  territory: string;
}

const TERRITORIES = ['NA', 'EMEA', 'APAC', 'Japan'];

export const OFFICE_COLUMNS = [
  'officeCode',
  'city',
  'phone',
  'addressLine1',
  'addressLine2',
  'state',
  'country',
  'postalCode',
  'territory',
];

export function generateOffices(count: number, seed: number): Office[] {
  faker.seed(seed);
  const offices: Office[] = [];

  for (let i = 1; i <= count; i++) {
    offices.push({
      officeCode: truncate(String(i), COL.officeCode),
      city: truncate(faker.location.city(), COL.city),
      phone: truncate(faker.phone.number(), COL.phone),
      addressLine1: truncate(faker.location.streetAddress(), COL.addressLine1),
      addressLine2: truncate(
        faker.datatype.boolean(0.3) ? faker.location.secondaryAddress() : null,
        COL.addressLine2
      ),
      state: truncate(faker.location.state({ abbreviated: true }), COL.state),
      country: truncate(faker.location.country(), COL.country),
      postalCode: truncate(faker.location.zipCode(), COL.postalCode),
      territory: truncate(TERRITORIES[(i - 1) % TERRITORIES.length], COL.territory),
    });
  }

  return offices;
}

export function officeToRow(o: Office): unknown[] {
  return [
    o.officeCode,
    o.city,
    o.phone,
    o.addressLine1,
    o.addressLine2,
    o.state,
    o.country,
    o.postalCode,
    o.territory,
  ];
}
