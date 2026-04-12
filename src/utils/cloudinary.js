import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { getPublicIdfromUrl } from "./getPublic_Id.js";

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
    if (fs.existsSync(localfilePath)) {
      fs.unlinkSync(localfilePath); // deleting the file from local server
    }
    return response;
  } catch (error) {
    if (fs.existsSync(localfilePath)) {
      fs.unlinkSync(localfilePath);
    }
    // remove the locally saved temporary file as the upload operation got failed
    console.error("Cloudinary upload error:", error);
    return null;
  }
};

const deletefromCloudinary = async (url, resourceType = "image") => {
  try {
    if (!url) return;
    const publicId = getPublicIdfromUrl(url);
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    console.log("Old file Delete Successfully");
  } catch (error) {
    console.log("Error deleting file:", error);
  }
};

export { uploadOnCloudinary, deletefromCloudinary };
