import { PrismaClient, Trigger, Alert, Prisma } from "@prisma/client";

// there might be a better way to generate this type
const alertWithTrigger = Prisma.validator<Prisma.AlertArgs>()({
  include: { trigger: true },
});

export type AlertWithTrigger = Prisma.AlertGetPayload<typeof alertWithTrigger>;

export const getAlertsByUserId = async (
  userId: string
): Promise<AlertWithTrigger[]> => {
  const prisma = new PrismaClient();

  const alerts = await prisma.alert.findMany({
    where: {
      userId,
    },
    include: {
      trigger: true,
    },
  });

  return alerts;
};

export const createAlert = async (
  userId: string,
  trigger: Trigger,
  price: number
): Promise<Alert> => {
  const prisma = new PrismaClient();

  return await prisma.alert.create({
    data: {
      userId,
      triggerId: trigger.id,
      price,
    },
  });
};
