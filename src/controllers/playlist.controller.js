import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name?.trim()) {
    throw new ApiError(400, "Playlist name is required");
  }

  //TODO: create playlist

  const userId = req.user._id;
  const playlist = await Playlist.create({
    name: name.trim(),
    description: description.trim() || "",
    videos: [],
    owner: userId,
  });
  if (!playlist) {
    throw new ApiError(500, "Something went wrong");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "invalid user id");
  }
  const playlists = await Playlist.find({
    owner: userId,
  })
    .sort({
      createdAt: -1,
    })
    .select("name description videos createdAt");

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid Playlist id");
  }

  const playlist = await Playlist.findOne({
    _id: playlistId,
    // owner: req.user._id,
  })
    .select("name description videos createdAt")
    .populate("videos", "title thumbnail duration");

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const getPlaylistWithVideos = asyncHandler(async (req, res) => {
  const { playListId } = req.params;
  if (!isValidObjectId(playListId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playListId),
      },
    },
    {
      //Join Videos
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    }, // Owner join
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $addFields: {
        owner: { $first: "$owner" },
        videoCount: {
          $size: {
            $ifNull: ["$videos", []],
          },
        },
      },
    }, // clean output
    {
      $project: {
        //playlist info
        name: 1,
        description: 1,
        createdAt: 1,
        videoCount: 1,

        //video info
        "videos._id": 1,
        "videos.title": 1,
        "videos.thumbnail": 1,
        "videos.duration": 1,

        //owner info
        "owner.userName": 1,
        "owner.avatar": 1,
      },
    },
  ]);
  if (!playlist.length) {
    throw new ApiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist[0], "Playlist fetched Successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
