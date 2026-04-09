import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweets.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const userId = req.user?._id;
  const videoExist = await Video.findById(videoId);
  if (!videoExist) {
    throw new ApiError(404, "Video not found");
  }

  //checking if it already liked
  const isLiked = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });

  if (isLiked) {
    await Like.deleteOne({ _id: isLiked._id });

    return res.status(200).json(new ApiResponse(200, {}, "Video Unliked"));
  }

  //TODO: toggle like on video
  // like
  const like = await Like.create({
    video: videoId,
    likedBy: userId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, like, "Video liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }
  const userId = req.user?._id;
  const commentExist = await Comment.findById(commentId);
  if (!commentExist) {
    throw new ApiError(404, "Comment does not exist");
  }
  const likeExist = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });
  if (likeExist) {
    await Like.deleteOne({
      comment: commentId,
      likedBy: userId,
    });
    return res.status(200).json(new ApiResponse(200, {}, "Comment Unliked"));
  }

  const like = await Like.create({
    comment: commentId,
    likedBy: userId,
  });
  return res.status(201).json(201, like, "Comment like successfully");
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }
  const userId = req.user._id;

  const tweetExist = await Tweet.findById(tweetId);
  if (!tweetExist) {
    throw new ApiError(404, "Tweet not Found");
  }

  const isLiked = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });
  if (isLiked) {
    await Like.deleteOne({
      tweet: tweetId,
      likedBy: userId,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Tweet unliked successfully"));
  }

  const newLike = await Like.create({
    tweet: tweetId,
    likedBy: userId,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, newLike, "Tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = new mongoose.Types.ObjectId(req.user?._id);
  const { page = 1, limit = 10 } = req.query;

  const pipeline = [
    {
      $match: {
        likedBy: userId,
        video: { $exists: true },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
      },
    },
    {
      $addFields: {
        video: {
          $first: "$video",
        },
      },
    }, // ❌ Remove invalid videos (optional safety)
    {
      $match: {
        "video._id": { $exists: true },
      },
    },
    // 🔥 Sort by latest liked
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        _id: 0,
        likedAt: "$createdAt",
        "video._id": 1,
        "video.title": 1,
        "video.thumbnail": 1,
        "video.duration": 1,
      },
    },
  ];
  const options = {
    limit: parseInt(limit) || 10,
    page: parseInt(page) || 1,
  };

  const likedVideos = await Like.aggregatePaginate(pipeline, options);
  if (!likedVideos) {
    throw new ApiError(500, "Something Went wrong");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked video fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
