// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export type Data = {
  cards: Card[];
};

type Card = {
  title: string;
  description: string;
};

const cards = [
  {
    title: "Test",
    description:
      "Example using Next.js with TypeScript, React, and Tailwind CSS.",
  },
  {
    title: "Next.js + TypeScript Example",
    description:
      "Example using Next.js with TypeScript, React, and Tailwind CSS.",
  },
  {
    title: "Next.js + TypeScript Example",
    description:
      "Example using Next.js with TypeScript, React, and Tailwind CSS.",
  },
  {
    title: "Next.js + TypeScript Example",
    description:
      "Example using Next.js with TypeScript, React, and Tailwind CSS.",
  },
  {
    title: "Next.js + TypeScript Example",
    description:
      "Example using Next.js with TypeScript, React, and Tailwind CSS.",
  },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // wait 5 seconds before returning
  res.status(200).json({
    cards,
  });
}
