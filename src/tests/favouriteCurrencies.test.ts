// Importowanie odpowiednich modułów i funkcji

test("Sprawdź ulubione kryptowaluty użytkownika", async () => {
  const mockCtx = {
    db: {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          favouriteCurrencies: [
            {
              id: 1,
              name: "Bitcoin",
              snapshots: [
                {
                  id: 1,
                  volumen: 1000,
                  price: 50000,
                  marketCap: 1000000,
                  snapshotDate: new Date("2023-10-25"),
                },
              ],
            },
          ],
        }),
      },
    },
    session: {
      userId: "exampleUserId",
    },
  };

  const result = await adminRouter.query.getFavouriteCurrencies.resolve({
    ctx: mockCtx,
  });

  expect(result).toEqual([
    {
      id: 1,
      name: "Bitcoin",
      snapshots: [
        {
          id: 1,
          volumen: 1000,
          price: 50000,
          marketCap: 1000000,
          snapshotDate: new Date("2023-10-25"),
        },
      ],
    },
  ]);
});
