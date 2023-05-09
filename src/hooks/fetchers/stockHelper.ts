// api/tools/security[id] check if security exists

import type { ExternalResponse } from "../../helpers/errors";
import type { SecurityResponse } from "../../pages/api/tools/security/[id]";

export const doesSecurityExist = async (ticker: string): Promise<boolean> => {
  const response = await fetch(`/api/tools/security/${ticker}`);

  const data: ExternalResponse<SecurityResponse> = await response.json();

  if (data.failed) {
    throw new Error(data.error);
  }

  return data.data?.doesSecurityExist ?? false;
};
