import React, { useState, useEffect } from "react";
import axios from "axios";

const YourComponent = () => {
  const [cryptoData, setCryptoData] = useState([]);

  const cryptoIds = ["bitcoin", "ethereum"];
  const vsCurrency = "usd";
  const days = 365;
  const interval = "daily";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const newData = [];
        for (const crypto of cryptoIds) {
          const endDate = new Date().toISOString().slice(0, 10);
          const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10);

          const queryParams = {
            vs_currency: vsCurrency,
            days: days,
            interval: interval,
            from: startDate,
            to: endDate,
          };

          const url = `https://api.coingecko.com/api/v3/coins/${crypto}/market_chart?${new URLSearchParams(
            queryParams,
          )}`;
          const response = await axios.get(url);

          if (
            response.data &&
            response.data.prices &&
            response.data.total_volumes
          ) {
            const prices = response.data.prices;
            const volumes = response.data.total_volumes;

            for (let i = 0; i < days; i++) {
              const date = new Date(prices[i][0]).toISOString().slice(0, 10);
              const price = prices[i][1];
              const volume = volumes[i][1];

              // Dodaj dane do tablicy
              newData.push({ crypto, date, price, volume });
            }
          } else {
            console.error("Error decoding JSON response or data not found.");
          }
        }
        setCryptoData(newData);
      } catch (error) {
        console.error("Error fetching data from Coingecko API.", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Pobrane dane kryptowalut:</h2>
      <ul>
        {cryptoData.map((data, index) => (
          <li key={index}>
            <p>
              <strong>Kryptowaluta:</strong> {data.crypto}
            </p>
            <p>
              <strong>Data:</strong> {data.date}
            </p>
            <p>
              <strong>Cena:</strong> {data.price}
            </p>
            <p>
              <strong>Wolumen:</strong> {data.volume}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default YourComponent;
