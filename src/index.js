import dotenv from "dotenv";
import connectDB from "./db/index.js";
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import express from "express";

dotenv.config({ path: "./.env" });

await connectDB();
// const app = express();
// // await connectDB();

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.PROJECT_URL}/${DB_NAME}`);
//     app.on("error", (error) => {
//       console.log("ERRR: ", error);
//       throw error;
//     });
// app.get("/", (req, res) => {
//       res.send("Server running 🚀");
//     });
//     app.listen(process.env.PORT, () => {
//       console.log(`App is listening on port ${process.env.PORT}`);
//     });

//   } catch (error) {
//     console.log("this is mongoose error", error);
//     process.exit(1)
//   }
// })();
