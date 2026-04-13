import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deletefromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  const pipeline = [];

  //query
  if (query) {
    pipeline.push({
      $match: {
        title: {
          $regex: query,
          $options: "i", // case-insensitive
        },
      },
    });
  }

  //filter by user
  if (userId && isValidObjectId(userId)) {
    pipeline.push({
      $match: {
        $owner: new mongoose.Types.ObjectId(userId),
      },
    });
  }

  //only published videos
  pipeline.push({
    $match: {
      isPublished: true,
    },
  });

  //owner lookup
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "owner",
      pipeline: [
        {
          $project: {
            userName: 1,
            avatar: 1,
          },
        },
      ],
    },
  });

  //convert owner array -> object
  pipeline.push({
    $addFields: {
      owner: { $first: "$owner" },
    },
  });

  // 🔥 Sorting
  pipeline.push({
    $sort: {
      [sortBy]: sortType === "asc" ? 1 : -1,
    },
  });

  pipeline.push({
    $project: {
      title: 1,
      thumbnail: 1,
      description: 1,
      views: 1,
      createdAt: 1,
      duration: 1,
      "owner.userName": 1,
      "owner.avatar": 1,
    },
  });

  const options = {
    limit: parseInt(limit) || 10,
    page: parseInt(page) || 1,
  };
  const videos = await Video.aggregatePaginate(pipeline, options);
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
  //
});

const publishAVideo = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and Description is required");
  }

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video and Thumbnail is required");
  }

  const uploadVideo = await uploadOnCloudinary(videoLocalPath);
  if (!uploadVideo?.url) {
    throw new ApiError(500, "Video Upload failed");
  }

  const uploadThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!uploadThumbnail?.url) {
    throw new ApiError(500, "Thumbnail Upload failed");
  }

  const video = await Video.create({
    videoFile: {
      url: uploadVideo.url,
      publicId: uploadVideo.public_id,
    },
    thumbnail: {
      url: uploadThumbnail.url,
      publicId: uploadThumbnail.public_id,
    },
    title: title.trim(),
    description: description.trim(),
    duration: uploadVideo.duration || 0,
    views: 0,
    isPublished: true,
    owner: userId,
  });

  if (!video) {
    throw new ApiError(500, "Something went wrong");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video upload successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $inc: {
        views: 1, // increase view count
      },
    },
    {
      new: true,
    }
  ).populate("owner", "userName avatar");
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video Ids");
  }

  const { title, description } = req.body;
  const userId = req.user._id;

  const video = await Video.findOne({
    _id: videoId,
    owner: userId,
  });

  if (!video) {
    throw new ApiError(404, "Video is not found");
  }

  const oldThumbnail = video.thumbnail;
  let newThumbnailUrl = video.thumbnail;

  const newThumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!title?.trim() && !description?.trim() && !newThumbnailLocalPath) {
    throw new ApiError(400, "Atleast One Field is required for updation");
  }
  if (newThumbnailLocalPath) {
    const uploadThumbnail = await uploadOnCloudinary(newThumbnailLocalPath);

    if (!uploadThumbnail?.url) {
      throw new ApiError(500, "Thumbnail Upload failed");
    }
    newThumbnailUrl = uploadThumbnail.url;
    if (oldThumbnail) {
      await deletefromCloudinary(oldThumbnail, "image");
    }
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        ...(title && { title: title.trim() }),
        ...(description && { description: description.trim() }),
        thumbnail: newThumbnailUrl,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedVideo) {
    throw new ApiError(404, "Video not found or Unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video Info Updated"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;
  //TODO: delete video

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }

  const video = await Video.findOne({
    _id: videoId,
    owner: userId,
  });
  if (!video) {
    throw new ApiError(404, "Video not found or Unauthorized");
  }

  // 🔥 Delete video file from Cloudinary
  if (video.videoFile) {
    await deletefromCloudinary(video.videoFile, "video");
  }

  // 🔥 Delete thumbnail from Cloudinary
  if (video.thumbnail) {
    await deletefromCloudinary(video.thumbnail, "image");
  }

  const deletingVideo = await Video.findByIdAndDelete(videoId);
  if (!deletingVideo) {
    throw new ApiError(500, "Someything went wrong");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted Successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }
  const userId = req.user._id;

  const video = await Video.findOne({
    _id: videoId,
    owner: userId,
  });

  if (!video) {
    throw new ApiError(404, "Video not found or unauthorized");
  }

  video.isPublished = !video.isPublished;

  await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video,
        `Video is ${isPublished ? "Published" : "Unpublished"} successfully `
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
