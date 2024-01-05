import { RouterOutputs } from "~/utils/api";

export type AdminGetAllCurrenciesOutput =
  RouterOutputs["admin"]["getAllCurrencies"];

export type GetLatestDayCurrenciesSnapshotsOutput =
  RouterOutputs["currency"]["getLatestDayCurrenciesSnapshots"];

export type GetCurrencyByIdOutput =
  RouterOutputs["currency"]["getCurrencyById"];
