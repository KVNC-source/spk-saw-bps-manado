import instance from "./axios";
// ^ adjust path if your axios instance is in lib/axios.ts

export const adminMitraApi = {
  getAll: async () => {
    const res = await instance.get("/admin/mitra");
    return res.data;
  },

  getById: async (id: number) => {
    const res = await instance.get(`/admin/mitra/${id}`);
    return res.data;
  },

  create: async (data: {
    nama_mitra: string;
    alamat?: string;
    no_hp?: string;
    bank?: string;
    no_rekening?: string;
  }) => {
    const res = await instance.post("/admin/mitra", data);
    return res.data;
  },

  update: async (
    id: number,
    data: {
      nama_mitra?: string;
      alamat?: string;
      no_hp?: string;
      bank?: string;
      no_rekening?: string;
    },
  ) => {
    const res = await instance.patch(`/admin/mitra/${id}`, data);
    return res.data;
  },

  remove: async (id: number) => {
    const res = await instance.delete(`/admin/mitra/${id}`);
    return res.data;
  },
};
