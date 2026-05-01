const { errorResponse, successResponse } = require("../utils/errors");
const {
  createExpenseService,
  getExpensesService,
} = require("../services/expenses.service");

const createExpense = async (req, res) => {
  try {
    const expense = await createExpenseService(
      req.body,
      req.header("Idempotency-Key")
    );

    return res.status(201).json(successResponse(expense));
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res
      .status(statusCode)
      .json(errorResponse(err.message || "Failed to create expense", statusCode));
  }
};

const getExpenses = async (req, res) => {
  try {
    const expenses = await getExpensesService(req.query.category);
    return res.status(200).json(successResponse(expenses));
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res
      .status(statusCode)
      .json(errorResponse(err.message || "Failed to load expenses", statusCode));
  }
};

module.exports = {
  createExpense,
  getExpenses,
};
