// api/tools/security[id] check if security exists

import { ExternalResponse } from "@/helpers/errors";
import { SecurityResponse } from "@/pages/api/tools/security/[id]";
import { useState, useEffect } from "react";

export const doesSecurityExist = async (
  ticker: string
): Promise<boolean | undefined> => {
  const response = await fetch(`/api/tools/security/${ticker}`);

  const data: ExternalResponse<SecurityResponse> = await response.json();

  if (data.failed) {
    throw new Error(data.error);
  }

  return data.data?.doesSecurityExist;
};
