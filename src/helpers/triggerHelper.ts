import { PrismaClient, Trigger, Alert, StockEODData } from "@prisma/client";
import { createAlert } from "./alertHelper";
import { NotFoundError, BadRequestError } from "./errors";

export const createTrigger = async (
  userId: string,
  symbol: string,
  price: number,
  type: string
): Promise<Trigger> => {
  const prisma = new PrismaClient();

  const trigger = await prisma.trigger.create({
    data: {
      userId,
      symbol,
      price,
      type,
    },
  });

  return trigger;
};

export const deleteTrigger = async (id: string): Promise<Trigger> => {
  const prisma = new PrismaClient();

  const trigger = await prisma.trigger.delete({
    where: {
      id,
    },
  });

  return trigger;
};

export const getTriggersByUserId = async (
  userId: string
): Promise<Trigger[]> => {
  const prisma = new PrismaClient();

  const triggers = await prisma.trigger.findMany({
    where: {
      userId,
    },
  });

  return triggers;
};

// TODO: run this on a cron job
// alternatively we can pass in the EOD data from the other cron job and avoid the DB calls
export const checkTriggers = async (): Promise<Alert[]> => {
  const prisma = new PrismaClient();

  const triggers = await prisma.trigger.findMany();

  const alerts: Alert[] = [];

  for (const trigger of triggers) {
    const { symbol, price, type, userId, fired } = trigger;

    // TODO: decide if we want to use the fired field. probably not needed if we are just using EOD data and fetching once a day
    // if (fired) continue;

    const priceData = await prisma.stockEODData.findMany({
      where: {
        symbol: symbol.toUpperCase(),
      },
      orderBy: {
        date: "desc",
      },
      take: 1,
    });

    if (priceData.length === 0) {
      // we don't have any data to check against
      continue;
    }

    const { close } = priceData[0];

    if (type === "above" && close >= price) {
      const alert = await createAlert(userId, trigger, close);
      alerts.push(alert);
    } else if (type === "below" && close <= price) {
      const alert = await createAlert(userId, trigger, close);
      alerts.push(alert);
    }
  }

  return alerts;
};
