
import { axiosInstance } from "../lib/axois";

export const getVideoToken = async () => {
  const res = await axiosInstance.get("/video/token");
  return res.data;
};