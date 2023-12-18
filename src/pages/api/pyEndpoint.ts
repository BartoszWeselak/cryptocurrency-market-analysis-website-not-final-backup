import { exec } from "child_process";
import path from "path";

export default function handler(req, res) {
  let { currencyId, days, secondCurrencyId } = req.query;
  days = days || 30;

  if (isNaN(secondCurrencyId)) {
    console.log("is nan");
    secondCurrencyId = "";
  }
  exec(
    `python src/pyApi/analysis.py ${currencyId} ${days} ${secondCurrencyId}`,
    (error, stdout, stderr) => {
      res.status(200).json({ message: stdout });
    },
  );
}
