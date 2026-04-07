import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }

  const tweet = await Tweet.create({
    owner: req.user._id,
    content,
  });

  const createdTweet = await Tweet.findById(tweet._id);
  if (!createTweet) {
    throw new ApiError(500, "Something went wrong");
  }

  const populateTweet = await tweet.populate(
    "owner",
    "avatar fullName userName"
  );
  return res
    .status(200)
    .json(new ApiResponse(200, populateTweet, "Tweet create Successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets

  const userId = req.user._id;
  const { limit = 10, page = 1 } = req.query;
  const fetchTweet = await Tweet.aggregate([
    {
      $match: {
        owner: userId,
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
  ]);

  const options = {
    limit: parseInt(limit),
    page: parseInt(page)
  }
  // const paginatedUserTweet = await Tweet.mongooseAggregatePaginate(fetchTweet, options)

  return res
  .status(200).json(new ApiResponse(200, paginatedUserTweet,"User tweet fetched successfully"))
});



const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
