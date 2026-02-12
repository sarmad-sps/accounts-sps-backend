// // import express from "express";
// // import cors from "cors";
// // import path from "path";
// // import "dotenv/config";
// // import { connectDB } from "./db.js";

// // // Routes Import
// // import authRoutes from "./routes/auth.js";
// // import stateRoutes from "./routes/state.js";
// // import expenseRoutes from "./routes/expenses.js";
// // import inventoryItemsRouter from "./routes/inventoryitem.js";
// // import inventoryRequests from "./routes/inventoryRequests.js";
// // import salaryRoutes from "./routes/SalaryRoute.js";
// // import paymentExpenseRoutes from "./routes/paymentExpense.js";
// // const app = express();
// // const PORT = process.env.PORT || 3000;
// // const CLIENT_DIST = process.env.CLIENT_DIST || "../client/dist";

// // app.use(cors());
// // app.use(express.json({ limit: "2mb" }));

// // // Route Middlewares
// // app.use("/api", authRoutes);      // /api/login
// // app.use("/api/state", stateRoutes); // /api/state
// // app.use("/api", expenseRoutes);   // aapke purane expense routes
// // app.use("/api/inventory-items", inventoryItemsRouter);
// // app.use("/api/inventory-requests", inventoryRequests);
// // app.use("/api/salaries", salaryRoutes);
// // app.use("/api/payments", paymentExpenseRoutes);

// // // Frontend Serving
// // const distPath = path.resolve(process.cwd(), CLIENT_DIST);
// // app.use(express.static(distPath));
// // app.get(/^(?!\/api).*/, (req, res) => {
// //   res.sendFile(path.join(distPath, "index.html"));
// // });

// // // Server Start
// // await connectDB();
// // app.listen(PORT, "0.0.0.0", () => {
// //   console.log(`🚀 Server organized and running on port ${PORT}`);
// // });


// import express from "express";
// import cors from "cors";
// import path from "path";
// import { connectDB } from "./db.js";

// // routes
// import authRoutes from "./routes/auth.js";
// import stateRoutes from "./routes/state.js";
// import expenseRoutes from "./routes/expenses.js";
// import inventoryItemsRouter from "./routes/inventoryitem.js";
// import inventoryRequests from "./routes/inventoryRequests.js";
// import salaryRoutes from "./routes/SalaryRoute.js";
// import paymentExpenseRoutes from "./routes/paymentExpense.js";

// const app = express();
// const CLIENT_DIST = process.env.CLIENT_DIST || "../client/dist";

// app.use(cors());
// app.use(express.json({ limit: "2mb" }));

// // 🔑 DB middleware (THIS is the fix)
// app.use(async (req, res, next) => {
//   try {
//     await connectDB();
//     next();
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Database connection failed" });
//   }
// });

// // routes
// app.use("/api", authRoutes);
// app.use("/api/state", stateRoutes);
// app.use("/api", expenseRoutes);
// app.use("/api/inventory-items", inventoryItemsRouter);
// app.use("/api/inventory-requests", inventoryRequests);
// app.use("/api/salaries", salaryRoutes);
// app.use("/api/payments", paymentExpenseRoutes);

// // frontend
// const distPath = path.resolve(process.cwd(), CLIENT_DIST);
// app.use(express.static(distPath));
// app.get(/^(?!\/api).*/, (req, res) => {
//   res.sendFile(path.join(distPath, "index.html"));
// });

// // ❌ NO app.listen
// export default app;


import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";

// routes
import authRoutes from "./routes/auth.js";
import stateRoutes from "./routes/state.js";
import expenseRoutes from "./routes/expenses.js";
import inventoryItemsRouter from "./routes/inventoryitem.js";
import inventoryRequests from "./routes/inventoryRequests.js";
import salaryRoutes from "./routes/SalaryRoute.js";
import paymentExpenseRoutes from "./routes/paymentExpense.js";
import transactionRoutes from "./routes/transactionRoutes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// 🔑 DB middleware (serverless-safe)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// ✅ Health check (fixes `/` 404)
app.get("/", (req, res) => {
  res.json({ status: "Backend running 🚀" });
});

// routes
app.use("/api", authRoutes);
app.use("/api/state", stateRoutes);
app.use("/api", expenseRoutes);
app.use("/api/inventory-items", inventoryItemsRouter);
app.use("/api/inventory-requests", inventoryRequests);
app.use("/api/salaries", salaryRoutes);
app.use("/api/payments", paymentExpenseRoutes);
app.use("/api/transactions", transactionRoutes);
// ❌ NO app.listen on Vercel
export default app;
