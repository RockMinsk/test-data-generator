import { faker } from '@faker-js/faker';
import { EmployeeValidityRatio } from '../config/config.types';
import { selectByRatio } from '../validity/validityProfile';
import { truncate, COL } from '../utils/truncate';

export interface Employee {
  employeeNumber: number;
  lastName: string;
  firstName: string;
  extension: string;
  email: string;
  officeCode: string;
  reportsTo: number | null;
  jobTitle: string;
}

export const EMPLOYEE_COLUMNS = [
  'employeeNumber',
  'lastName',
  'firstName',
  'extension',
  'email',
  'officeCode',
  'reportsTo',
  'jobTitle',
];

export function generateEmployees(
  officeCodes: string[],
  employeesPerOffice: number,
  validityRatios: EmployeeValidityRatio,
  seed: number
): Employee[] {
  faker.seed(seed + 1);
  const employees: Employee[] = [];
  let employeeNumber = 1000;

  // First pass — one manager per office
  const managerNumbers: Record<string, number> = {};
  for (const officeCode of officeCodes) {
    managerNumbers[officeCode] = employeeNumber;
    employees.push({
      employeeNumber,
      lastName: truncate(faker.person.lastName(), COL.lastName),
      firstName: truncate(faker.person.firstName(), COL.firstName),
      extension: truncate(`x${faker.number.int({ min: 1000, max: 9999 })}`, COL.extension),
      email: truncate(faker.internet.email().toLowerCase(), COL.email),
      officeCode,
      reportsTo: null,
      jobTitle: truncate('Sales Manager (NA)', COL.jobTitle),
    });
    employeeNumber++;
  }

  // Second pass — remaining employees per office
  for (const officeCode of officeCodes) {
    for (let i = 0; i < employeesPerOffice - 1; i++) {
      const profile = selectByRatio(validityRatios);
      const reportsTo =
        profile === 'with_manager' ? managerNumbers[officeCode] : null;

      employees.push({
        employeeNumber,
        lastName: truncate(faker.person.lastName(), COL.lastName),
        firstName: truncate(faker.person.firstName(), COL.firstName),
        extension: truncate(`x${faker.number.int({ min: 1000, max: 9999 })}`, COL.extension),
        email: truncate(faker.internet.email().toLowerCase(), COL.email),
        officeCode,
        reportsTo,
        jobTitle: truncate('Sales Rep', COL.jobTitle),
      });
      employeeNumber++;
    }
  }

  return employees;
}

export function employeeToRow(e: Employee): unknown[] {
  return [
    e.employeeNumber,
    e.lastName,
    e.firstName,
    e.extension,
    e.email,
    e.officeCode,
    e.reportsTo,
    e.jobTitle,
  ];
}
