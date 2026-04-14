import mongoose, { Mongoose } from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

// const getChannelStats = asyncHandler(async (req, res) => {
//   // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

//   const userId = new mongoose.Types.ObjectId(req.user._id);

//   // total videos and views
//   const videoStats = await Video.aggregate([
//     {
//       $match: {
//         owner: userId,
//       },
//     },
//     {
//       $group: {
//         _id: null,
//         totalVideos: { $sum: 1 },
//         totalViews: { $sum: "$views" },
//       },
//     },
//   ]);

//   // total subscribers
//   const subscriberStats = await Subscription.aggregate([
//     {
//       $match: {
//         channel: userId,
//       },
//     },
//     {
//       $group: {
//         _id: null,
//         totalSubscribers: { $sum: 1 },
//       },
//     },
//   ]);

//   //total likes on videos
//   const likeStats = await Like.aggregate([
//     {
//       $lookup: {
//         from: "videos",
//         localField: "video",
//         foreignField: "_id",
//         as: "video",
//       },
//     },
//     {
//       $addFields: {
//         video: {
//           $first: "$video",
//         },
//       },
//     },
//     {
//       $match: {
//         "video.owner": userId,
//       },
//     },
//     {
//       $group: {
//         _id: null,
//         totalLikes: { $sum: 1 },
//       },
//     },
//   ]);

//   //Latest videos

//   const latestVideos = await Video.find({
//     owner: userId,
//   })
//     .sort({ createdAt: -1 })
//     .limit(5)
//     .select("title thumbnail views createdAt");

//   return res.status(200).json(
//     new ApiResponse(
//       200,
//       {
//         totalVideos: videoStats[0]?.totalVideos || 0,
//         totalViews: videoStats[0]?.totalViews || 0,
//         totalSubscribers: subscriberStats[0]?.totalSubscribers || 0,
//         totalLikes: likeStats[0]?.totalLikes || 0,
//         latestVideos,
//       },
//       "Dashboard Stats Fetched successfully"
//     )
//   );
// });

const getChannelStats = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);

  const channel = await User.aggregate([
    {
      $match: {
        _id: userId,
      },
    },
    //total subscribers
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $addFields: {
        totalSubscribers: { $size: "$subscribers" },
      },
    },
    //videos
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "videos",
      },
    },
    {
      $addFields: {
        totalVideos: { $size: "$videos" },
        totalViews: {
          $sum: {
            $map: {
              input: "$videos",
              as: "video",
              in: "$$video.views",
            },
          },
        },
      },
    },
    //likes
    {
      $lookup: {
        from: "likes",
        localField: "videos._id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        totalLikes: {
          $size: "$likes",
        },
      },
    },
    {
      $project: {
        totalLikes: 1,
        totalSubscribers: 1,
        totalVideos: 1,
        totalViews: 1,
        userName: 1,
        fullName: 1,
        coverImage: 1,
        avatar: 1,

        // 🔥 remove heavy fields
        subscribers: 0,
        videos: 0,
        likes: 0,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel not Found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "Channel stats fetched Successfully")
    );
});
const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user._id;

  const total = await Video.countDocuments({ owner: userId });
  const videos = await Video.find({
    owner: userId,
  })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .select("title thumbnail views createdAt");

//   if (!videos?.length) {
//     throw new ApiError(404, "Videos not found");
//   }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          videos,
          total,
          page: parseInt(page),
          totalPages: Math.ceil(total / limit),
        },
        "Videos Fetched successfully"
      )
    );
});

export { getChannelStats, getChannelVideos };
