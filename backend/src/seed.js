const db = require('./db');

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

const customers = [
  { id: 'cust_01', name: 'Amara Chukwu', email: 'amara.c@example.com', approvedRefundsLast90Days: 0 },
  { id: 'cust_02', name: 'Tunde Bakare', email: 'tunde.b@example.com', approvedRefundsLast90Days: 1 },
  { id: 'cust_03', name: 'Sarah Lin', email: 'sarah.lin@example.com', approvedRefundsLast90Days: 4 },
  { id: 'cust_04', name: 'James O\u2019Reilly', email: 'james.o@example.com', approvedRefundsLast90Days: 0 },
  { id: 'cust_05', name: 'Priya Sharma', email: 'priya.s@example.com', approvedRefundsLast90Days: 2 },
  { id: 'cust_06', name: 'Diego Fernandez', email: 'diego.f@example.com', approvedRefundsLast90Days: 0 },
  { id: 'cust_07', name: 'Grace Okafor', email: 'grace.o@example.com', approvedRefundsLast90Days: 0 },
  { id: 'cust_08', name: 'Wei Zhang', email: 'wei.z@example.com', approvedRefundsLast90Days: 1 },
  { id: 'cust_09', name: 'Fatima Noor', email: 'fatima.n@example.com', approvedRefundsLast90Days: 0 },
  { id: 'cust_10', name: 'Liam Murphy', email: 'liam.m@example.com', approvedRefundsLast90Days: 0 },
  { id: 'cust_11', name: 'Ngozi Eze', email: 'ngozi.e@example.com', approvedRefundsLast90Days: 0 },
  { id: 'cust_12', name: 'Carlos Mendes', email: 'carlos.m@example.com', approvedRefundsLast90Days: 0 },
  { id: 'cust_13', name: 'Emma Johansson', email: 'emma.j@example.com', approvedRefundsLast90Days: 0 },
  { id: 'cust_14', name: 'Kwame Mensah', email: 'kwame.m@example.com', approvedRefundsLast90Days: 0 },
  { id: 'cust_15', name: 'Olivia Bennett', email: 'olivia.b@example.com', approvedRefundsLast90Days: 0 },
];

const orders = [
  { id: 'ord_01', customerId: 'cust_01', item: 'Wireless Noise-Cancelling Headphones', amount: 189.99, deliveredAt: daysAgo(5), finalSale: 0, opened: 0 },
  { id: 'ord_02', customerId: 'cust_02', item: 'Running Shoes (Size 10)', amount: 129.5, deliveredAt: daysAgo(12), finalSale: 0, opened: 1 },
  { id: 'ord_03', customerId: 'cust_03', item: '4K Monitor 27"', amount: 349.0, deliveredAt: daysAgo(8), finalSale: 0, opened: 0 },
  { id: 'ord_04', customerId: 'cust_04', item: 'Clearance Winter Jacket', amount: 59.99, deliveredAt: daysAgo(3), finalSale: 1, opened: 0 },
  { id: 'ord_05', customerId: 'cust_05', item: 'Espresso Machine', amount: 620.0, deliveredAt: daysAgo(10), finalSale: 0, opened: 0 },
  { id: 'ord_06', customerId: 'cust_06', item: 'Bluetooth Speaker', amount: 79.99, deliveredAt: daysAgo(45), finalSale: 0, opened: 1 },
  { id: 'ord_07', customerId: 'cust_07', item: 'Standing Desk', amount: 410.0, deliveredAt: daysAgo(2), finalSale: 0, opened: 1 },
  { id: 'ord_08', customerId: 'cust_08', item: 'Mechanical Keyboard', amount: 145.0, deliveredAt: daysAgo(20), finalSale: 0, opened: 0 },
  { id: 'ord_09', customerId: 'cust_09', item: 'Yoga Mat Set', amount: 39.99, deliveredAt: daysAgo(6), finalSale: 0, opened: 1 },
  { id: 'ord_10', customerId: 'cust_10', item: 'Gaming Chair', amount: 289.0, deliveredAt: daysAgo(15), finalSale: 0, opened: 1 },
  { id: 'ord_11', customerId: 'cust_11', item: 'Electric Kettle', amount: 34.5, deliveredAt: daysAgo(1), finalSale: 0, opened: 0 },
  { id: 'ord_12', customerId: 'cust_12', item: 'Clearance Bluetooth Earbuds', amount: 24.99, deliveredAt: daysAgo(9), finalSale: 1, opened: 1 },
  { id: 'ord_13', customerId: 'cust_13', item: 'Air Fryer XL', amount: 99.0, deliveredAt: daysAgo(28), finalSale: 0, opened: 0 },
  { id: 'ord_14', customerId: 'cust_14', item: 'DSLR Camera', amount: 899.0, deliveredAt: daysAgo(4), finalSale: 0, opened: 0 },
  { id: 'ord_15', customerId: 'cust_15', item: 'Office Chair Cushion', amount: 22.0, deliveredAt: daysAgo(60), finalSale: 0, opened: 1 },
];

const insertCustomer = db.prepare(
  `INSERT OR REPLACE INTO customers (id, name, email, approvedRefundsLast90Days) VALUES (@id, @name, @email, @approvedRefundsLast90Days)`
);
const insertOrder = db.prepare(
  `INSERT OR REPLACE INTO orders (id, customerId, item, amount, deliveredAt, finalSale, opened) VALUES (@id, @customerId, @item, @amount, @deliveredAt, @finalSale, @opened)`
);

const run = db.transaction(() => {
  db.exec('DELETE FROM refund_requests');
  customers.forEach((c) => insertCustomer.run(c));
  orders.forEach((o) => insertOrder.run(o));
});

run();

console.log(`Seeded ${customers.length} customers and ${orders.length} orders.`);
