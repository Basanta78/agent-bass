import express from "express";
import routes from "./routes.js";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", routes);

const x = 42;
// await x; // Noncompliant - This remains noncompliant since `await` is for promises, not regular values.

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
