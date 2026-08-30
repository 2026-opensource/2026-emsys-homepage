import axios from "axios";
import { getToken } from "../utils/token";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/sliders`;
const authConfig = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export async function fetchSliderImages() {
  const response = await axios.get(BASE_URL);
  return response.data;
}

export async function fetchSliderImagesForAdmin() {
  const response = await axios.get(`${BASE_URL}/admin`, authConfig());
  return response.data.data ?? [];
}

export async function uploadSliderImage(file, altText) {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("altText", altText);
  const response = await axios.post(BASE_URL, formData, authConfig());
  return response.data.data;
}

export async function updateSliderImage(id, changes) {
  const response = await axios.patch(`${BASE_URL}/${id}`, changes, authConfig());
  return response.data.data;
}

export async function reorderSliderImages(imageIds) {
  await axios.patch(`${BASE_URL}/order`, { imageIds }, authConfig());
}

export async function deleteSliderImage(id) {
  await axios.delete(`${BASE_URL}/${id}`, authConfig());
}
