import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweets.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }

  const tweet = await Tweet.create({
    owner: req.user._id,
    content: content.trim(),
  });

  const createdTweet = await Tweet.findById(tweet._id);
  if (!createdTweet) {
    throw new ApiError(500, "Something went wrong");
  }

  const populateTweet = await tweet.populate(
    "owner",
    "avatar fullName userName"
  );
  return res
    .status(201)
    .json(new ApiResponse(201, populateTweet, "Tweet create Successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets

  const userId = new mongoose.Types.ObjectId(req.user._id);
  const { limit = 10, page = 1 } = req.query;
  const pipeline = [
    {
      $match: {
        owner: userId,
        isDeleted: false,
      },
    },
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
    {
      $sort: {
        createdAt: -1,
      },
    },
  ];

  const options = {
    limit: parseInt(limit) || 10,
    page: parseInt(page) || 1,
  };

  const aggregate = Tweet.aggregate(pipeline);
  const paginatedUserTweet = await Tweet.aggregatePaginate(aggregate, options);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        paginatedUserTweet,
        "User tweet fetched successfully"
      )
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet

  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(404, "Tweet Not found");
  }
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }
  const newTweet = await Tweet.findOneAndUpdate(
    {
      _id: tweetId,
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
  // const newTweet = await Tweet.findByIdAndUpdate(
  //   tweetId,
  //   {
  //     $set: {
  //       content: content,
  //     },
  //   },
  //   {
  //     new: true,
  //   }
  // );
  if (!newTweet) {
    throw new ApiError(404, "Tweet not found or unauthorized");
  }
  return res.status(200).json(new ApiResponse(200, newTweet, "Tweet Updated"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet

  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(404, "Tweet Not found");
  }
  const deletedTweet = await Tweet.findOneAndUpdate(
    {
      _id: tweetId,
      owner: req.user._id,
      isDeleted: false,
    },
    {
      $set: {
        isDeleted: true,
      },
    },
    { new: true }
  );
  if (!deletedTweet) {
    throw new ApiError(404, "Tweet not found or Already Deleted");
  }
  return res.status(200).json(new ApiResponse(200, {}, "Tweet deleted"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
