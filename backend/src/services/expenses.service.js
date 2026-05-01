const { v4: uuidv4 } = require("uuid");
const { db } = require("../db");

const allAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        return reject(err);
      }

      return resolve(rows);
    });
  });

const getAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        return reject(err);
      }

      return resolve(row);
    });
  });

const runAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function runCallback(err) {
      if (err) {
        return reject(err);
      }

      return resolve(this);
    });
  });

const getExpensesService = async (category) => {
  const params = [];
  let sql = `
    SELECT id, amount, category, description, date, created_at
    FROM expenses
  `;

  if (category) {
    sql += " WHERE category = ?";
    params.push(category);
  }

  sql += " ORDER BY date DESC, created_at DESC";

  return allAsync(sql, params);
};

const createExpenseService = async (payload, idempotencyKey) => {
  const amount = Number(payload.amount);
  const category = String(payload.category || "").trim();
  const description = String(payload.description || "").trim();
  const date = String(payload.date || "").trim();

  if (!Number.isFinite(amount)) {
    const error = new Error("Amount is required");
    error.statusCode = 400;
    throw error;
  }

  if (!category) {
    const error = new Error("Category is required");
    error.statusCode = 400;
    throw error;
  }

  if (!date) {
    const error = new Error("Date is required");
    error.statusCode = 400;
    throw error;
  }

  if (idempotencyKey) {
    const existingExpense = await getAsync(
      `
        SELECT id, amount, category, description, date, created_at
        FROM expenses
        WHERE idempotency_key = ?
      `,
      [idempotencyKey]
    );

    if (existingExpense) {
      return existingExpense;
    }
  }

  const expense = {
    id: uuidv4(),
    amount,
    category,
    description,
    date,
    created_at: new Date().toISOString(),
    idempotency_key: idempotencyKey || null,
  };

  await runAsync(
    `
      INSERT INTO expenses (
        id,
        amount,
        category,
        description,
        date,
        created_at,
        idempotency_key
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      expense.id,
      expense.amount,
      expense.category,
      expense.description,
      expense.date,
      expense.created_at,
      expense.idempotency_key,
    ]
  );

  return expense;
};

module.exports = {
  createExpenseService,
  getExpensesService,
};
