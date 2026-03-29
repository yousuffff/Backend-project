export const getPublicIdfromUrl = (url)=>{
  const parts = url.split("/");
  const fileName = parts[parts.length - 1]; // avatar.png
  const publicId = fileName.split(".")[0]; // avatar
  return publicId;

}