import { asyncHandler } from "../utils/asyncHandler.js";

const register = asyncHandler(async (req, res) => {
  res.status(200).jsos({
    message: "Ok",
  });
});

export default register;
