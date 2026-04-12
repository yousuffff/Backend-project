import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    // videoFile: {
    //   type: String,
    //   required: true,
    // },
    // thumbnail: {
    //   type: String,
    //   required: true,
    // },
    videoFile: {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
    },
    thumbnail: {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
videoSchema.plugin(mongooseAggregatePaginate);
// 🔥 Indexes
videoSchema.index({ owner: 1 });
videoSchema.index({ createdAt: -1 });

export const Video = mongoose.model("Video", videoSchema);
