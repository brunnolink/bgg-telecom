import express from "express";
import cors from "cors";
import { appRouter } from "./http/routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(appRouter); 
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});