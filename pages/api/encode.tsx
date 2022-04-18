import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../helpers/db"

type record = {
  statement: string;
  answer: string[];
  userId: string;
}

export default async function  handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method == "POST") {
    const rawForm = req.body
    const data = []

    let id = await prisma.statement.findFirst({
      select: {
        id: true
      },
      where: {
        text: rawForm.statement
      }
    })

        
    if (id === null) {
      // TODO: Add new statement
      res.status(400).json({"error": "Statement not found"})
      return
    }


    for (const key in rawForm) {
      if (key === "statement") {
        continue
      }
      if (rawForm[key] instanceof Array) {
        for (const value of rawForm[key]) {
          data.push({
            statementId: id.id, 
            key: key,
            answer: value,
            userEmail: rawForm.email 
          })
        }
        continue
      } 
      //otherwise it's a string
      const datum = {
        statementId: id.id,
        key: key,
        answer: rawForm[key],
        userEmail: rawForm.email 
      }
      data.push(datum)
      
    }

    await prisma.responses.createMany({
      data: data
    })

    res.status(200).json({"success": "Success"})
  }
}