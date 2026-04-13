export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
}

export interface SeedConfig {
  faker_seed: number;
  offices: number;
  employees_per_office: number;
  product_lines: number;
  products_per_line: number;
  customers: number;
}

export interface OrderDetailsRange {
  min: number;
  max: number;
}

export interface GenerateConfig {
  orders_per_customer: number;
  order_details_per_order: OrderDetailsRange;
}

export interface OrderValidityRatio {
  with_payment: number;
  without_payment: number;
  with_multiple_payments: number;
  [key: string]: number;
}

export interface EmployeeValidityRatio {
  with_manager: number;
  without_manager: number;
  [key: string]: number;
}

export interface OfficeValidityRatio {
  with_employees: number;
  without_employees: number;
  [key: string]: number;
}

export interface ValidityConfig {
  orders: OrderValidityRatio;
  employees: EmployeeValidityRatio;
  offices: OfficeValidityRatio;
}

export interface TdgConfig {
  db: DbConfig;
  seed: SeedConfig;
  generate: GenerateConfig;
  validity: ValidityConfig;
  batch_size: number;
  log_level: string;
}
