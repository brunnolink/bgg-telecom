import express from "express";
import cors from "cors";
import { appRouter } from "./http/routes";
import dotenv from "dotenv";

const app = express();
dotenv.config();
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);
app.use(express.json());
app.use(appRouter);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});