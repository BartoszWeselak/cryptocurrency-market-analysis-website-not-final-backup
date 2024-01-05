import React, { useCallback } from "react";
import { AddFavouriteCurrencyInput } from "~/schemes/currency-schemes";
import { FaStar } from "react-icons/fa";

import { api } from "~/utils/api";
import { FaReact } from "react-icons/fa";
export type AddFavouriteCurrencyButtonProps = {
  isFavourite: boolean;
  currencyName?: string;
} & AddFavouriteCurrencyInput;

const AddFavouriteCurrencyButton: React.FC<AddFavouriteCurrencyButtonProps> = ({
  id,
  isFavourite,
  currencyName,
}) => {
  const apiUtils = api.useUtils();
  const addFavouriteCurrencyMutation =
    api.currency.addFavouriteCurrency.useMutation({
      onSuccess() {
        void apiUtils.currency.invalidate();
      },
    });
  const handleAddFavouriteCurrency = useCallback(() => {
    addFavouriteCurrencyMutation.mutate({ id, isFavourite });
  }, [addFavouriteCurrencyMutation, id, isFavourite]);
  return (
    <button onClick={handleAddFavouriteCurrency}>
      <FaStar
        className={`${isFavourite ? "text-sky-500" : "text-slate-500"}`}
      />
    </button>
  );
};
export default AddFavouriteCurrencyButton;
