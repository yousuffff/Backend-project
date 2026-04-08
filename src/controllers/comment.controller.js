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

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video Id");
  }

  const pipeline = [
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
        isDeleted: false,
      },
    },
    //owner lookup
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              avatar: 1,
              fullName: 1,
              userName: 1,
            },
          },
        ],
      },
    },

    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
    //likes lookUp
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
        isLiked: {
          $in: [new mongoose.Types.ObjectId(req.user._id), "$likes.likedBy"],
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        likesCount: 1,
        isLiked: 1,
        "owner.avatar": 1,
        "owner.fullName": 1,
        "owner.userName": 1,
      },
    },
  ];
  const option = {
    limit: parseInt(limit) || 10,
    page: parseInt(page) || 1,
  };
  const paginatedComment = await Comment.aggregatePaginate(pipeline, option);
  return res
    .status(200)
    .json(
      new ApiResponse(200, paginatedComment, "Comment Fetched Successfully")
    );
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

  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid id");
  }
  const { content } = req.body;
  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }
  const comment = await Comment.findOneAndUpdate(
    {
      _id: commentId,
      owner: req.user._id,
      isDeleted: false,
    },
    {
      $set: {
        content: content.trim(),
      },
    },
    {
      new: true,
    }
  );

  if (!comment) {
    throw new ApiError(400, "Comment not found or unauthorized");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment Update successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid object Id");
  }
  const deletedComment = await Comment.findOneAndUpdate(
    {
      _id: commentId,
      owner: req.user._id,
      isDeleted: false,
    },
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    },
    {
      new: true,
    }
  );
  if (!deletedComment) {
    throw new ApiError(400, "Comment not found or already Deleted");
  }
  return res.status(200).json(new ApiResponse(200, {}, "Comment deleted"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
