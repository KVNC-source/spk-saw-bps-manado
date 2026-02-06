import api from "@/lib/axios";

// ADMIN – list all mitra
export const getMitraList = async () => {
  const res = await api.get("/mitra");
  return res.data;
};

// MITRA – dashboard summary
export const getMitraDashboard = async () => {
  const res = await api.get("/spk/mitra/dashboard");
  return res.data;
};
