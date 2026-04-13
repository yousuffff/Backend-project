import multer from "multer";
import path from "path";
import { ApiError } from "../utils/ApiError.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    const ext = path.extname(file.originalname);

    cb(null, uniqueSuffix + ext);
    // cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "video/mp4",
    "video/mkv",
    "video/webm",
    "image/jpeg",
    "image/png",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Invalid File format"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, //200mb
  },
});
export { upload };
