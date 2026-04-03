import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  // console.log(process.env.PROJECT_URL);

  try {
    const connectionInstance = await mongoose.connect(process.env.PROJECT_URL, {
      dbName: DB_NAME,
    });

    console.log(`✅ MongoDB connected: ${connectionInstance.connection.host}`);
  } catch (error) {
    
    console.error("❌ MongoDB connection failed:", error.message);

    process.exit(1);
  }
};
export default connectDB;

//

// const connectDB = async () => {
//   try {
//     const connectionInstance = await mongoose.connect(
//       `${process.env.PROJECT_URL}/${DB_NAME}`
//     );
//     console.log(
//       `\n mongoDB conected !! DB HOST: ${connectionInstance.connection.host}`
//     );
//   } catch (error) {
//     console.log("ERROR MONGODB CONNECTION FAILED: ", error);
//     process.exit(1);
//   }
// };

// export default connectDB;
