import React, { useState, useEffect } from "react";
import { api } from "~/utils/api";

const DropdownComponent = ({ excludedCurrencyId, onDropdownChange }) => {
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [selectedCurrencyId, setSelectedCurrencyId] = useState(null);
  const [allCurrencies, setAllCurrencies] = useState([]);
  const getAllCurrenciesExceptQuery =
    api.currency.getAllCurrenciesExcept.useQuery({
      id: parseInt(excludedCurrencyId),
    });

  useEffect(() => {
    if (getAllCurrenciesExceptQuery.data) {
      setAllCurrencies(getAllCurrenciesExceptQuery.data);
    }
  }, [getAllCurrenciesExceptQuery.data]);

  const handleChange = (e) => {
    const selectedCurrencyName = e.target.value;
    const selectedCurrency = allCurrencies.find(
      (currency) => currency.name === selectedCurrencyName,
    );

    setSelectedCurrency(selectedCurrencyName);
    const newSelectedCurrencyId = selectedCurrency ? selectedCurrency.id : null;
    setSelectedCurrencyId(selectedCurrency ? selectedCurrency.id : null);
    onDropdownChange(newSelectedCurrencyId);
  };

  return (
    <div className="my-4">
      <select
        id="currencies"
        value={selectedCurrency}
        onChange={handleChange}
        className="rounded-md border p-2"
      >
        <option value="">Select</option>
        {allCurrencies.map((currency) => (
          <option key={currency.id} value={currency.name}>
            {currency.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DropdownComponent;
