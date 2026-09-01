import axios from "axios";

const api = axios.create({
  baseURL: "https://decathlon-clone-pi.vercel.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
