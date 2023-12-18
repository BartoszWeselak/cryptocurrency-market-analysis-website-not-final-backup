import { z } from "zod";

export const currencySnapshotModelSchema = z.object({
  id: z.number().int().nonnegative(),
  volumen: z.number().int().nonnegative(),
  price: z.number(),
  marketCap: z.number().int().nonnegative(),
  snapshotDate: z.date(),
});

export const currencyModelSchema = z.object({
  id: z.number().int().nonnegative(),
  name: z.string().min(1),
  snapshots: z.array(currencySnapshotModelSchema),
});
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5),
});

export type AddFavouriteCurrencyInput = z.output<
  typeof addFavouriteCurrencySchema
>;
export const addFavouriteCurrencySchema = currencyModelSchema
  .pick({
    id: true,
  })
  .extend({ isFavourite: z.boolean() });

export type AddCurrencies = z.output<typeof addCurrenciesSchema>;
export const addCurrenciesSchema = z.object({
  currencies: currencyModelSchema
    .pick({ name: true })
    .extend({
      snapshots: currencySnapshotModelSchema.omit({ id: true }).array(),
    })
    .array(),
});

export const removeCurrencyByIdSchema = currencyModelSchema.pick({ id: true });

export const getCurrencyByIdSchema = currencyModelSchema.pick({ id: true });

export const getCurrencyByNameSchema = currencyModelSchema.pick({ name: true });

//create user testowe
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  password: z.string().min(6), // Minimalna długość hasła
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
