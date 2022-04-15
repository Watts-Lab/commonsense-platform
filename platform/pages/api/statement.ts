import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient()
export default async function  handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method == "GET") {
    const data = await prisma.statement.findFirst({
        select: {"text": true}
    })

    if (data) {
      return res.status(200).json({text: data.text})
    }
    return res.status(400).json({error: "No statement found in database"})
  }
}