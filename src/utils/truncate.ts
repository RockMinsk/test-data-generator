/**
 * Truncates a string to fit within the target DB column length.
 * Returns null unchanged.
 */
export function truncate(value: string, maxLength: number): string;
export function truncate(value: string | null, maxLength: number): string | null;
export function truncate(value: string | null, maxLength: number): string | null {
  if (value === null) return null;
  return value.length > maxLength ? value.substring(0, maxLength) : value;
}

/**
 * Column-length constants matching the classicmodels DDL.
 * Centralised here so every generator imports from a single source of truth.
 */
export const COL = {
  // offices
  officeCode: 10,
  territory: 10,

  // shared across offices / customers / employees
  city: 50,
  phone: 50,
  addressLine1: 50,
  addressLine2: 50,
  state: 50,
  country: 50,
  postalCode: 15,

  // employees
  lastName: 50,
  firstName: 50,
  extension: 10,
  email: 100,
  jobTitle: 50,

  // customers
  customerName: 50,
  contactLastName: 50,
  contactFirstName: 50,

  // products
  productCode: 15,
  productName: 70,
  productScale: 10,
  productVendor: 50,

  // productlines
  productLine: 50,

  // orders
  status: 15,

  // payments
  checkNumber: 50,
} as const;
