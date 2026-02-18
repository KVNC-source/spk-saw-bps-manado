import instance from "./axios";

/* ================================
   TYPES
================================ */

export interface Mitra {
  id: number;
  nama_mitra: string;
  alamat?: string;
  no_hp?: string;
  bank?: string;
  no_rekening?: string;
}

/* ================================
   API
================================ */

export const adminMitraApi = {
  getAll: async (): Promise<Mitra[]> => {
    const res = await instance.get("/spk/mitra");
    return res.data;
  },

  // Kalau belum ada backend-nya, jangan pakai ini dulu
  getById: async (id: number) => {
    const res = await instance.get(`/spk/mitra/${id}`);
    return res.data;
  },

  create: async (data: {
    nama_mitra: string;
    alamat?: string;
    no_hp?: string;
    bank?: string;
    no_rekening?: string;
  }) => {
    const res = await instance.post("/spk/mitra", data);
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
    const res = await instance.patch(`/spk/mitra/${id}`, data);
    return res.data;
  },

  remove: async (id: number) => {
    const res = await instance.delete(`/spk/mitra/${id}`);
    return res.data;
  },
};
