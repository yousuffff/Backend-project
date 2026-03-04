import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config()
import { DB_NAME } from "./constants";
import express from "express";

const app = express()(async () => {
  try {
    await mongoose.connect(`${process.env.PROJECT_URL}/${DB_NAME}`);
    app.on("error", (error) => {
      console.log("error :", error);
      throw error;
    });
    app.listen(process.env.PORT, () => {
      console.log(`App is running on pprt no ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("database connection error :", error);
    throw err;
  }
})();
