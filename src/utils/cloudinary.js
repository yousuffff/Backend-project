import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { getPublicIdfromUrl } from "./getPublic_Id";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localfilePath) => {
  try {
    if (!localfilePath) return null;
    const response = await cloudinary.uploader.upload(localfilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfull
    console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localfilePath); // deleting the file from local server
    return response;
  } catch (error) {
    fs.unlinkSync(localfilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

const deletefromCloudinary = async (url) => {
  try {
    if (!url) return;
    const publicId = getPublicIdfromUrl(url);
    await cloudinary.uploader.destroy(publicId);
    console.log("Old Image Delete Successfully");
  } catch (error) {
    console.log("Error deleting image:", error);
  }
};

export { uploadOnCloudinary, deletefromCloudinary };
