import express, { Express } from "express";
import { json } from "body-parser";
import cors from "cors";
import { router } from "./router/route";
import { AppDataSource } from "./db";
import cookieParser from "cookie-parser";
import { middleError } from "./middlewares/error";

const PORT: number = 4000;
const app: Express = express();

app.use(cors());
app.use(json());
app.use(cookieParser());
app.use("/api", router);
app.use(middleError);

const start = async () => {
  try {
    await AppDataSource.initialize()
      .then(() => {
        console.log(`Connected to DB`);
      })
      .catch((e) => {
        console.log(`Error connect to DB`);
      });
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
};
start();
