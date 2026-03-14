import dotenv from "dotenv";

// Load environment variables as early as possible.
// This module should be imported before any other module that relies on process.env.
// dotenv looks for a `.env` file in the current working directory (usually the project root).
dotenv.config();
