import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../helpers/db"

type record = {
  statement: string;
  answer: string[];
  userId: string;
}

export default async function  handler(req: NextApiRequest, res: NextApiResponse){
  if (req.method == "POST") {
    const rawForm = req.body
    
    const data = []
    for (const key in rawForm) {

      if (rawForm[key] instanceof Array) {
        for (const value of rawForm[key]) {
          data.push({
            statement: key,
            answer: value,
            userEmail: rawForm.email 
          })
        }
        continue
      } 
      //otherwise it's a string
      const datum = {
        statement: key,
        answer: rawForm[key],
        userEmail: rawForm.email 
      }
      data.push(datum)
      
    }

    console.log(rawForm.email)
    const prisma_res = await prisma.responses.createMany({
      data: data
    })
    
    res.redirect("/")
  }
}