// Load environment variables before any code that depends on process.env
import "./config.js";

import express, { json } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    // origin: process.env.CORS_ORIGIN,
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    credentials: true,
  })
);
//body parser
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

//cookies
app.use(cookieParser());

//static files
app.use(express.static("public"));

//import route
import userRouter from "./routes/user.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

//routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);

//404 route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not Found",
  });
});

//global error handler
app.use((err, req, res, next) => {
  console.log("Error", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server error",
  });
});

export { app };
