// pages/api/proxy.js

import { NextApiResponse } from "next";

export async function POST(req: Request , res: NextApiResponse) {
    const url = 'http://52.45.14.64/api/gq_mobile/v1';
  
    try {
      const apiRes = await fetch(url, {
        method: req.method,
        headers: {
          ...req.headers,
          'Content-Type': 'application/json',
        },
        body: req.method === 'POST' ? JSON.stringify(req.body) : null,
      });
  
      const data = await apiRes.json();
      return Response.json({ data }, { status: 200 });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  }
  