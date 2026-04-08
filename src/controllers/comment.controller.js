import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(401, "Video Not Found");
  }
  const { content } = req.body;
  if (!content?.trim()) {
    throw new ApiError(401, "Content is required");
  }

  const videoExist = await Video.findById(videoId);
  if (!videoExist) {
    throw new ApiError(404, "Video does not exist");
  }
  const comment = await Comment.create({
    content: content.trim(),
    video: videoId,
    owner: req.user._id,
  });
  if (!comment) {
    throw new ApiError(500, "Failed to create comment");
  }
  const populateComment = await comment.populate(
    "owner",
    "avatar fullName userName"
  );
  return res
    .status(200)
    .json(new ApiResponse(200, populateComment, "Comment create Successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
});

export { getVideoComments, addComment, updateComment, deleteComment };
