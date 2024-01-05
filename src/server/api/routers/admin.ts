import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  AddCurrencies,
  addCurrenciesSchema,
  getCurrencyByIdSchema,
  removeCurrencyByIdSchema,
} from "~/schemes/currency-schemes";

import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";

export const adminRouter = createTRPCRouter({
  addCurrency: adminProcedure
    .input(
      z.object({
        currencyName: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { currencyName } = input;
      const currencyHistory = await fetchCryptoHistoryByName(currencyName);
      if (!currencyHistory) throw new TRPCError({ code: "NOT_FOUND" });

      const preparedCurrencyHistory = prepareCurrencyHistory(currencyHistory);

      return await ctx.db.$transaction(async (t) => {
        for (const s of preparedCurrencyHistory) {
          await t.currencySnapshot.create({
            data: {
              marketCap: s.marketCap,
              price: s.price,
              volumen: s.volumen,
              snapshotDate: s.snapshotDate,
              currency: {
                connectOrCreate: {
                  create: { name: currencyName },
                  where: { name: currencyName },
                },
              },
            },
          });
        }
      });
    }),
  addCurrencies: adminProcedure
    // .input(addCurrenciesSchema)
    .mutation(async ({ input, ctx }) => {
      // const { currencies } = input;

      const dataToInsert = await fetchCoingeckoData("ethereum");
      if (!dataToInsert) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      /*
  data: {
        volumen: bitcoinData["usd_24h_vol"],
        price: bitcoinData["usd"],
        marketCap: bitcoinData["usd_market_cap"],
        snapshotDate: new Date(),
        currency: {
          connect: { name: "Bitcoin" }, // Assuming 'Bitcoin' is already present in the Currency table
        },*/

      return await ctx.db.currencySnapshot.create({
        data: {
          price: dataToInsert.usd,
          volumen: BigInt(parseInt(dataToInsert.usd_24h_vol)),
          marketCap: BigInt(parseInt(dataToInsert.usd_market_cap)),
          snapshotDate: new Date(),
          currency: {
            connectOrCreate: {
              create: { name: "ethereum" },
              where: { name: "ethereum" },
            },
          },
        },
      });
      // return await ctx.db.$transaction(async (t) => {
      //   for (const currency of currencies) {
      //     await t.currency.upsert({
      //       where: { name: currency.name },
      //       update: {},
      //       create: {
      //         name: currency.name,
      //         snapshots: {
      //           createMany: { data: currency.snapshots, skipDuplicates: true },
      //         },
      //       },
      //     });
      //   }
      // });
    }),

  removeCurrency: adminProcedure
    .input(removeCurrencyByIdSchema)
    .mutation(({ input, ctx }) => {
      const { id } = input;
      return ctx.db.currency.delete({ where: { id } });
    }),
  getAllCurrenciesAdmin: adminProcedure.query(({ ctx }) => {
    return ctx.db.currency.findMany({
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    });
  }),
  //delete
  deleteCurrencyById: adminProcedure
    .input(getCurrencyByIdSchema) // Use the same schema for input as the getCurrencyById query
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      // Find the cryptocurrency by ID
      const currencyToDelete = await ctx.db.currency.findUnique({
        where: { id: id },
        include: {
          snapshots: true,
          users: true,
        },
      });

      // If the specified currency is not found, throw an error
      if (!currencyToDelete) {
        throw new Error("Specified currency not found");
      }

      // Delete the currency along with its snapshots
      const deleteResult = await ctx.db.currency.delete({
        where: { id: id },
        include: { snapshots: true }, // Include snapshots for deletion
      });

      // Delete associated snapshots
      for (const snapshot of currencyToDelete.snapshots) {
        await ctx.db.currencySnapshot.delete({
          where: { id: snapshot.id },
        });
      }

      // Remove references to the deleted currency in the users array
      for (const user of currencyToDelete.users) {
        await ctx.db.user.update({
          where: { id: user.id },
          data: {
            favouriteCurrencies: {
              disconnect: { id: id },
            },
          },
        });
      }

      // Note: The 'deleteResult' variable now contains the deleted currency and its snapshots

      return deleteResult;
    }),
  getAllUsers: adminProcedure.query(({ ctx }) => {
    return ctx.db.user.findMany({
      select: { id: true, name: true, email: true },
    });
  }),

  deleteUserById: adminProcedure
    .input(z.object({ id: z.string() })) // Input schema for the user ID
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      // Find the user by ID
      const userToDelete = await ctx.db.user.findUnique({
        where: { id: id },
        include: {
          accounts: true,
          sessions: true,
          favouriteCurrencies: true,
        },
      });

      // If the specified user is not found, throw an error
      if (!userToDelete) {
        throw new Error("Specified user not found");
      }

      // Delete the user along with related data
      const deleteResult = await ctx.db.user.delete({
        where: { id: id },
        include: {
          accounts: true,
          sessions: true,
          favouriteCurrencies: true,
        },
      });

      // Delete associated accounts
      for (const account of userToDelete.accounts) {
        await ctx.db.account.delete({
          where: { id: account.id },
        });
      }

      // Delete associated sessions
      for (const session of userToDelete.sessions) {
        await ctx.db.session.delete({
          where: { id: session.id },
        });
      }

      // Delete associated favourite currencies
      for (const currency of userToDelete.favouriteCurrencies) {
        await ctx.db.currency.update({
          where: { id: currency.id },
          data: {
            users: {
              disconnect: { id: id },
            },
          },
        });
      }

      return deleteResult;
    }),

  //testowe
  addTestCurrencies: adminProcedure
    .input(addCurrenciesSchema)
    .mutation(async ({ input, ctx }) => {
      const { currencies } = input;

      return await ctx.db.$transaction(async (t) => {
        for (const currency of currencies) {
          await t.currency.upsert({
            where: { name: currency.name },
            update: {},
            create: {
              name: currency.name,
              snapshots: {
                createMany: { data: currency.snapshots, skipDuplicates: true },
              },
            },
          });
        }
      });
    }),
});

/*
async function fetchCoingecko(): Promise<Coingecko | null> {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_vol=true&include_market_cap=true",
    );
    if (!response.ok) {
      return null;
    }

    const data = response.json();

    return data as unknown as Coingecko;
  } catch (error) {
    return null;
  }
}

function prepareCoingeckoDataForDbInsert(
  data: Coingecko,
): AddCurrencies | null {}
*/

type CoingeckoReturnType<T extends string> = {
  [key in T]: CoinDataType;
};

type CoinDataType = {
  usd_24h_vol: number; // Assuming this is a string, change the type if necessary
  usd: number; // Assuming this is a string, change the type if necessary
  usd_market_cap: number; // Assuming this is a string, change the type if necessary
};
async function fetchCoingeckoData(coinName: string) {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinName}&vs_currencies=usd&include_24hr_vol=true&include_market_cap=true`,
    );
    const data =
      (await response.json()) as unknown as CoingeckoReturnType<string>;

    const coinData = data[coinName] as unknown as CoinDataType;

    return coinData;
  } catch (error) {
    return null;
  }
}

type CryptoHistory = {
  prices: number[][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
};

const BASE_COINGECKO_API_URL = "https://api.coingecko.com/api/v3" as const;
const CRYPTO_HISTORY_DAYS_COUNT = 364 as const;

async function fetchCryptoHistoryByName(
  name: string,
): Promise<CryptoHistory | null> {
  try {
    const url = new URL(`${BASE_COINGECKO_API_URL}/coins/${name}/market_chart`);
    url.searchParams.set("vs_currency", "usd");
    url.searchParams.set("days", CRYPTO_HISTORY_DAYS_COUNT.toString());
    url.searchParams.set("interval", "daily");

    const res = await fetch(url);
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as unknown as CryptoHistory;
  } catch (err) {
    return null;
  }
}

function prepareCurrencyHistory(data: CryptoHistory) {
  const out: {
    price: number;
    marketCap: bigint;
    volumen: bigint;
    snapshotDate: Date;
  }[] = [];
  const { prices, market_caps, total_volumes } = data;

  for (let day = 0; day < data.prices.length; ++day) {
    out.push({
      price: prices[day][1],
      marketCap: BigInt(Math.floor(market_caps[day][1])),
      volumen: BigInt(Math.floor(total_volumes[day][1])),
      snapshotDate: new Date(prices[day][0]),
    });
  }
  //   volumen: BigInt(parseInt(dataToInsert.usd_24h_vol)),
  return out;
}
