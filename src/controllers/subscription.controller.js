import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    // TODO: toggle subscription

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid object Id");
    }

    const userId = req.user._id;

    if (userId.toString() === channelId) {
        throw new ApiError(400, "You cannot subscribe to yourself");
    }
    const existSubcription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId,
    });

    if (existSubcription) {
        await Subscription.deleteOne({
            //   subscriber: userId,
            //   channel: channelId,
            _id: existSubcription._id,
        });

        return res.status(200).json(new ApiResponse(200, {}, "Unsubscribed"));
    }

    const newSubscription = await Subscription.create({
        subscriber: userId,
        channel: channelId,
    }).populate([
        { path: "subscriber", select: "userName avatar" },
        { path: "channel", select: "userName avatar" },
    ]);

    if (!newSubscription) {
        throw new ApiError(500, "Subscribed failed");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, newSubscription, "Subscribed successfully"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel Id");
    }

    const channelSubscriber = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $project: {
                            userName: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                subscriber: {
                    $first: "$subscriber",
                },
            },
        },
        {
            $group: {
                _id: null,
                totalSubscribers: { $sum: 1 },
                subscribers: { $push: "$subscriber" },
            },
        },
        {
            $project: {
                _id: 0,
                totalSubscribers: 1,
                subscribers: 1,
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channelSubscriber[0] || { totalSubscribers: 0, subscribers: [] },
                "Channel subscribers fetched successfully"
            )
        );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber id");
    }

    const userSubscribedChannel = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
                pipeline: [
                    {
                        $project: {
                            userName: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                channel: {
                    $first: "$channel",
                },
            },
        },
        {
            $group: {
                _id: null,
                totalChannels: { $sum: 1 },
                channels: { $push: "$channel" },
            },
        },
        {
            $project: {
                _id: 0,
                totalChannels: 1,
                channels: 1,
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                userSubscribedChannel[0] || { totalChannels: 0, channels: [] },
                "Channel list Fetch Successfully"
            )
        );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
