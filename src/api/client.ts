/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const client = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});
