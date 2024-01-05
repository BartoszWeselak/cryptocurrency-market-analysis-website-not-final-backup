import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { TextField } from "./TextField";
import CryptoChart from "./CryptoChart";
import Dropdown from "./Dropdown";
import Tab from "~/components/Tab";
import { Button } from "./Button";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useMemo } from "react";

async function fetchPython(currencyId, days, secondCurrencyId) {
  try {
    const res = await fetch(
      `/api/pyEndpoint?currencyId=${currencyId}&days=${days}&secondCurrencyId=${secondCurrencyId}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (_err) {
    return null;
  }
}

const TestModel = ({ currencyId }) => {
  const [days, setDays] = useState("");
  const [secondCurrencyId, setSecondCurrencyId] = useState("");
  const [fetchedData, setFetchedData] = useState(null);

  //fetch

  const PythonQuery = useQuery({
    queryKey: ["query-python"],
    queryFn: () => fetchPython(currencyId, days, secondCurrencyId),
  });
  //tabela
  //stat table
  const StatisticTable = ({ basicStats, secondCurrencyStats }) => {
    if (!basicStats) {
      return null;
    }

    const statsArray = [
      {
        label: "Stationary",
        value: message ? JSON.parse(message)?.message : null,
        valueSecondCurrency: message ? JSON.parse(message)?.message : null,
      },
      {
        label: "Mean",
        value: basicStats.mean.toFixed(2),
        valueSecondCurrency: secondCurrencyStats
          ? secondCurrencyStats.mean.toFixed(2)
          : null,
      },
      {
        label: "Standard Deviation",
        value: basicStats.std.toFixed(2),
        valueSecondCurrency: secondCurrencyStats
          ? secondCurrencyStats.std.toFixed(2)
          : null,
      },
      {
        label: "Min",
        value: basicStats.min.toFixed(2),
        valueSecondCurrency: secondCurrencyStats
          ? secondCurrencyStats.min.toFixed(2)
          : null,
      },
      {
        label: "Max",
        value: basicStats.max.toFixed(2),
        valueSecondCurrency: secondCurrencyStats
          ? secondCurrencyStats.max.toFixed(2)
          : null,
      },
      {
        label: "Median",
        value: basicStats.median.toFixed(2),
        valueSecondCurrency: secondCurrencyStats
          ? secondCurrencyStats.median.toFixed(2)
          : null,
      },
      {
        label: "Quantil 0,25",
        value: basicStats.quantiles?.[0].toFixed(2),
        valueSecondCurrency: secondCurrencyStats
          ? secondCurrencyStats.quantiles?.[0].toFixed(2)
          : null,
      },
      {
        label: "Quantil 0,5",
        value: basicStats.quantiles?.[1].toFixed(2),
        valueSecondCurrency: secondCurrencyStats
          ? secondCurrencyStats.quantiles?.[1].toFixed(2)
          : null,
      },
      {
        label: "Quantil 0,75",
        value: basicStats.quantiles?.[2].toFixed(2),
        valueSecondCurrency: secondCurrencyStats
          ? secondCurrencyStats.quantiles?.[2].toFixed(2)
          : null,
      },
    ];
    // message ? JSON.parse(message)?.message : null;
    return (
      <table className="w-full table-auto border-collapse border border-gray-400">
        <thead>
          <tr>
            {secondCurrencyStats && (
              <>
                <th className="border border-gray-400 px-4 py-2">Stat</th>
                <th className="border border-gray-400 px-4 py-2">
                  Value (Currency 1)
                </th>
                <th className="border border-gray-400 px-4 py-2">
                  Value (Currency 2)
                </th>
              </>
            )}
            {!secondCurrencyStats && (
              <>
                <th className="border border-gray-400 px-4 py-2">Stat</th>
                <th className="border border-gray-400 px-4 py-2">Value</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {statsArray.map((stat, index) => (
            <tr key={index} className="border border-gray-400">
              {secondCurrencyStats && (
                <>
                  <td className="border border-gray-400 px-4 py-2">
                    {stat.label}
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    {stat.value}
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    {stat.valueSecondCurrency}
                  </td>
                </>
              )}
              {!secondCurrencyStats && (
                <>
                  <td className="border border-gray-400 px-4 py-2">
                    {stat.label}
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    {stat.value}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  //data table
  const DataTable = ({ dataArray }) => (
    <table className="w-full table-auto border-collapse border border-gray-400">
      <thead>
        <tr>
          <th className="border border-gray-400 px-4 py-2">Day</th>
          <th className="border border-gray-400 px-4 py-2">Main</th>
          {dataArray.some((item) => item.secondary !== null) && (
            <th className="border border-gray-400 px-4 py-2">Secondary</th>
          )}
        </tr>
      </thead>
      <tbody>
        {dataArray.map((item) => (
          <tr key={item.name} className="border border-gray-400">
            <td className="border border-gray-400 px-4 py-2">{item.name}</td>
            <td className="border border-gray-400 px-4 py-2">
              {item.main.toFixed(2)}
            </td>
            {item.secondary !== null && (
              <td className="border border-gray-400 px-4 py-2">
                {item.secondary.toFixed(2)}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  // Sprawdzanie statusu i dostosowywanie wyświetlania

  let content;
  let content1;
  let content2;
  let content3;
  let message;
  let progress;
  if (PythonQuery.status === "loading") {
    message = "";
    progress = "Loading ...";
  } else if (PythonQuery.status === "error") {
    message = "";
    progress = "error ...";
  } else if (PythonQuery.status === "success") {
    message = PythonQuery?.data?.message;
    progress = "";
  }

  //arima
  const arima = message ? JSON.parse(message)?.forecast_first_currency : null;
  let arimaSecondCurrency = message
    ? JSON.parse(message)?.forecast_second_currency
    : null;

  let correlation = message ? JSON.parse(message)?.correlation : null;

  let data = null;
  let dataSecondCurrency = null;
  let dataYPred = null;
  let dataYPredSecondCurrency = null;

  const trendsData = message
    ? JSON.parse(message)?.first_currency?.first
    : null;
  const yPredArray = trendsData?.y_pred;
  const rmse = trendsData?.rmse;
  const r2 = trendsData?.r2;
  // const mean = trendsData?.basic_stats_first_currency?.mean;

  const trendsDataSecondCurrency = message
    ? JSON.parse(message)?.first_currency?.first
    : null;

  const yPredArraySecondCurrency = trendsDataSecondCurrency?.y_pred;
  const rmseSecondCurrency = trendsDataSecondCurrency?.rmse;
  const r2SecondCurrency = trendsDataSecondCurrency?.r2;

  const basicStats = message
    ? JSON.parse(message)?.basic_stats_first_currency
    : null;

  const basicStatsSecondCurrency = message
    ? JSON.parse(message)?.basic_stats_second_currency
    : null;

  //test
  const dates = message ? JSON.parse(message)?.dates : null;

  const mean = basicStatsSecondCurrency?.mean;
  const quantile2 = basicStatsSecondCurrency?.quantiles?.[0];
  const quantile = basicStats?.quantiles?.[0];
  const test = message ? JSON.parse(message)?.message : null;
  if (arima) {
    data = arima.map((value, index) => ({
      name: dates[index],
      main: value,
      secondary: null,
    }));
  }
  if (arimaSecondCurrency) {
    dataSecondCurrency = arima.map((value, index) => ({
      name: dates[index],
      main: value,
      secondary: arimaSecondCurrency[index],
    }));
  }
  if (yPredArray) {
    dataYPred = yPredArray.map((value, index) => ({
      name: dates[index],
      main: value,
      secondary: null,
    }));
  }
  if (yPredArraySecondCurrency) {
    dataYPredSecondCurrency = yPredArray.map((value, index) => ({
      name: dates[index],
      main: value,
      secondary: yPredArraySecondCurrency[index],
    }));
  }

  if (
    message.includes("timeseries is stationary") ||
    message.includes("timeseries are stationary")
  ) {
    if (message.includes("timeseries are stationary")) {
      content1 = (
        <div>
          <p>wariant 1</p>

          <CryptoChart
            data={dataSecondCurrency}
            nameOne="test"
            nameTwo="test"
          />
        </div>
      );
      content2 = (
        <div>
          <StatisticTable
            basicStats={basicStats}
            secondCurrencyStats={basicStatsSecondCurrency}
          />
        </div>
      );
      content3 = (
        <div>
          <DataTable dataArray={dataSecondCurrency} />
        </div>
      );
    } else if (message.includes("timeseries is stationary")) {
      content1 = (
        <div>
          <p>wariant 2</p>
          <CryptoChart data={data} nameOne="test" nameTwo="test" />
        </div>
      );
      content2 = (
        <div>
          <StatisticTable
            basicStats={basicStats}
            secondCurrencyStats={basicStatsSecondCurrency}
          />
        </div>
      );
      content3 = (
        <div>
          <DataTable dataArray={data} />
        </div>
      );
    } else {
      content = message;
    }
  } else if (
    message.includes("timeseries is non-stationary") ||
    message.includes("timeseries are non-stationary")
  ) {
    {
      if (message.includes("timeseries are non-stationary")) {
        if (r2 > 0.71) {
          content = "r2 < n1";
          content1 = (
            <div>
              <p>wariant 3</p>

              <CryptoChart
                data={dataYPredSecondCurrency}
                nameOne="test"
                nameTwo="test"
              />
            </div>
          );
          content2 = (
            <div>
              <StatisticTable
                basicStats={basicStats}
                secondCurrencyStats={basicStatsSecondCurrency}
              />
            </div>
          );
          content3 = (
            <div>
              <DataTable dataArray={dataYPredSecondCurrency} />
            </div>
          );
        } else {
          content = "r2 > n2";
          content1 = (
            <div>
              <p>wariant 4</p>

              <CryptoChart
                data={dataSecondCurrency}
                nameOne="test"
                nameTwo="test"
              />
            </div>
          );
          content2 = (
            <div>
              <StatisticTable
                basicStats={basicStats}
                secondCurrencyStats={basicStatsSecondCurrency}
              />
            </div>
          );
          content3 = (
            <div>
              <DataTable dataArray={dataSecondCurrency} />
            </div>
          );
        }
      } else if (message.includes("timeseries is non-stationary")) {
        if (r2 > 0.71) {
          content = "r2 < n3";

          content1 = (
            <div>
              <p>wariant 5</p>

              <CryptoChart data={dataYPred} nameOne="test" nameTwo="test" />
            </div>
          );
          content2 = (
            <div>
              <StatisticTable
                basicStats={basicStats}
                secondCurrencyStats={basicStatsSecondCurrency}
              />
            </div>
          );
          content3 = (
            <div>
              <DataTable dataArray={dataYPred} />
            </div>
          );
        } else {
          content = "r2 > n4";
          content1 = (
            <div>
              <p>wariant 6</p>

              <CryptoChart data={data} nameOne="test" nameTwo="test" />
            </div>
          );
          content2 = (
            <div>
              <StatisticTable
                basicStats={basicStats}
                secondCurrencyStats={basicStatsSecondCurrency}
              />
            </div>
          );
          content3 = (
            <div>
              <DataTable dataArray={data} />
            </div>
          );
        }
      } else {
        content = message;
      }
    }
  } else {
    content = message;
  }

  //test
  //content = message;
  const handleCalculateClick = () => {
    let selectedCurrencyId = selectedCurrencyIdFromDropdown;

    setSecondCurrencyId(selectedCurrencyId);

    // Aktualizacja stanu
    setSelectedCurrencyIdFromDropdown(selectedCurrencyId);

    // Ponowne pobranie danych z użyciem nowego selectedCurrencyId

    PythonQuery.refetch();
  };

  //tabs
  const tabs = [
    {
      title: "Chart",
      content: <div>{content1}</div>,
    },
    {
      title: "Stats",
      content: <div>{content2}</div>,
    },
    { title: "List", content: <div>{content3}</div> },
  ];
  //dropdown
  const [selectedCurrencyIdFromDropdown, setSelectedCurrencyIdFromDropdown] =
    useState(null);

  const handleDropdownChange = (selectedCurrencyId) => {
    setSecondCurrencyId(selectedCurrencyId);

    setSelectedCurrencyIdFromDropdown(selectedCurrencyId || "");
  };
  //chart test
  const router = useRouter();
  const cryptoId = router.query.cryptoId as string;

  const primary = api.currency.getCurrencyById.useQuery(
    { id: parseInt(cryptoId) },
    { enabled: router.isReady },
  );
  const secondary = api.currency.getCurrencyById.useQuery(
    { id: selectedCurrencyIdFromDropdown },
    { enabled: router.isReady },
  );

  const currencyDataSecondary =
    secondary?.data?.snapshots.map((snapshot) => snapshot.price.toFixed(2)) ||
    [];
  const currencyDataPrimary =
    primary?.data?.snapshots.map((snapshot) => snapshot.price.toFixed(2)) || [];
  const reverseSecondary = currencyDataSecondary.reverse();

  const reversePrimary = currencyDataPrimary.reverse();

  const currencyDataPrice = useMemo(() => {
    if (primary && primary.data?.snapshots) {
      const reversedSnapshots = primary.data.snapshots.slice().reverse();

      return reversedSnapshots.map((snapshot, index) => ({
        name: new Date(snapshot.snapshotDate).toLocaleDateString("en-GB"),
        main: reversePrimary[index],
        secondary: reverseSecondary[index],
      }));
    }
    return [];
  }, [primary]);

  const name = primary?.data?.name;
  const nameSecond = secondary?.data?.name;

  //test
  return (
    <div>
      <CryptoChart
        data={currencyDataPrice}
        nameOne={name}
        nameTwo={nameSecond}
      />
      <p>
        In statistics and econometrics, and in particular in time series
        analysis, an autoregressive integrated moving average (ARIMA) model is a
        generalization of an autoregressive moving average (ARMA) model. To
        better comprehend the data or to forecast upcoming series points, both
        of these models are fitted to time series data
      </p>

      <br />
      <h2>number of past days to consider in calculation:</h2>
      <TextField
        type="text"
        value={days}
        onChange={(e) => {
          const inputText = e.target.value;

          // Validate if the input is a positive number
          if (/^\d+$/.test(inputText) || inputText === "") {
            setDays(inputText);
          }
        }}
        placeholder="Enter days"
      />

      <p>Selected ID in Parent: {selectedCurrencyIdFromDropdown}</p>
      <Dropdown
        excludedCurrencyId={currencyId}
        onDropdownChange={handleDropdownChange}
      />

      <Button onClick={handleCalculateClick}>
        {" "}
        {PythonQuery.isLoading ? "Loading..." : "Calculate"}
      </Button>
      <br />
      {content}

      {progress}
      <Tab tabs={tabs} />
    </div>
  );
};

export default TestModel;
