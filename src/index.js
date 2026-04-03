import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

// dotenv.config({ path: "./.env" }); // connect .env file
const PORT = process.env.PORT || 8000;
connectDB() // connect database
  .then(() => {
    app.on("error", (error) => {
      console.log("ERROR", error);
      throw error;
    });

    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    app.get("/home", (req, res) => {
      res.send("Hello!!! welcome to my home");
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port: ${PORT}`);
    });
  })
  .catch((err) => console.log("Mongo DB connection failed", err));

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
