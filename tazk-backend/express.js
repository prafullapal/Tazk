import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import v1Routes from "./routes/index.js";
import { errorResponse, notFoundError } from "./middlewares/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: [
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : process.env.CLIENT_URL,
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use("/v1/api", v1Routes);

app.use(notFoundError);
app.use((error, req, res, next) => {
  errorResponse(res, error.message, error, error.status || 500);
});

export default app;
