import api from "./axios";
import type { CalculateSawDto } from "../types/calculate-saw.dto";
import type { SawResultDto } from "../types/saw-result.dto";

export async function calculateSaw(
  payload: CalculateSawDto,
): Promise<SawResultDto> {
  const res = await api.post<SawResultDto>("/spk/saw/calculate", payload);
  return res.data;
}
