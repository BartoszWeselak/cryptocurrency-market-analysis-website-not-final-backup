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
import StatisticsTable from "./StatisticTable";
import * as ss from "simple-statistics";
const Analysys = ({ currencyId }) => {
  const [secondCurrencyId, setSecondCurrencyId] = useState("");

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

  // const currencyDataSecondary =
  //   secondary?.data?.snapshots.map((snapshot) => snapshot.price.toFixed(2)) ||
  //   [];
  const currencyDataSecondary =
    secondary?.data?.snapshots.map((snapshot) => ({
      price: snapshot.price.toFixed(2),
      volume: Number(snapshot.volumen),
      marketcap: Number(snapshot.marketCap),
    })) || [];
  const currencyDataPrimary =
    primary?.data?.snapshots.map((snapshot) => ({
      price: snapshot.price.toFixed(2),
      volume: Number(snapshot.volumen),
      marketcap: Number(snapshot.marketCap),
    })) || [];
  const datePrimary =
    primary?.data?.snapshots.map((snapshot) => snapshot.snapshotDate) || [];
  const reverseSecondary = currencyDataSecondary.reverse();

  const reversePrimary = currencyDataPrimary.reverse();
  const currencyDataPrimaryOnlyPrice =
    primary?.data?.snapshots.map((snapshot) => snapshot.price.toFixed(2)) || [];
  const currencyDataPrimaryOnlyVolume =
    primary?.data?.snapshots.map((snapshot) => snapshot.volumen) || [];
  const currencyDataPrimaryOnlyMarketcap =
    primary?.data?.snapshots.map((snapshot) => snapshot.marketCap) || [];
  const currencyDataSecondaryOnlyPrice =
    secondary?.data?.snapshots.map((snapshot) => snapshot.price.toFixed(2)) ||
    [];
  const currencyDataSecondaryOnlyVolume =
    secondary?.data?.snapshots.map((snapshot) => snapshot.volumen) || [];
  const currencyDataSecondaryOnlyMarketcap =
    secondary?.data?.snapshots.map((snapshot) => snapshot.marketCap) || [];
  const currencyDataPrice = useMemo(() => {
    if (primary && primary.data?.snapshots) {
      const reversedSnapshots = primary.data.snapshots.slice().reverse();

      return reversedSnapshots.map((snapshot, index) => ({
        name: new Date(snapshot.snapshotDate).toLocaleDateString("en-GB"),
        main: reversePrimary[index]?.price,
        secondary: reverseSecondary[index]?.price,
        volumeMain: reversePrimary[index]?.volume,
        volumeSecondary: reverseSecondary[index]?.volume,
        marketcapMain: reversePrimary[index]?.marketcap,
        marketcapSecondary: reverseSecondary[index]?.marketcap,
      }));
    }
    return [];
  }, [primary]);

  const name = primary?.data?.name;
  const nameSecond = secondary?.data?.name;

  //predykcje
  const predictionsPrimary =
    api.currency.getCurrencyPredictionsByCurrencyId.useQuery(
      { currencyId: parseInt(cryptoId) },
      { enabled: router.isReady },
    );
  const predictionsSecondary =
    api.currency.getCurrencyPredictionsByCurrencyId.useQuery(
      { currencyId: selectedCurrencyIdFromDropdown },
      { enabled: router.isReady },
    );
  const predictionDataPrimary =
    predictionsPrimary?.data?.map((prediction) =>
      prediction.price.toFixed(2),
    ) || [];

  const predictionDataSecondary =
    predictionsSecondary?.data?.map((prediction) =>
      prediction.price.toFixed(2),
    ) || [];

  const predictionDatePrimary =
    predictionsPrimary?.data?.map((prediction) => prediction.predictionDate) ||
    [];
  //new Date(snapshot.snapshotDate).toLocaleDateString("en-GB")
  //predictionDatePrimary[index]
  const predictionDataPrice = useMemo(() => {
    if (predictionsPrimary) {
      return predictionDataPrimary.map((prediction, index) => ({
        name: new Date(predictionDatePrimary[index]).toLocaleDateString(
          "en-GB",
        ),
        main: predictionDataPrimary[index],
        secondary: predictionDataSecondary[index],
      }));
    }
    return [];
  }, [primary]);
  //podstawowe statystyki

  // const basicStatisticsPrimary =
  //   api.currency.getCurrencyStatisticsByCurrencyId.useQuery(
  //     { id: parseInt(cryptoId) },
  //     { enabled: router.isReady },
  //   );

  // const basicStatisticsSecondary =
  //   api.currency.getCurrencyStatisticsByCurrencyId.useQuery(
  //     { id: selectedCurrencyIdFromDropdown },
  //     { enabled: router.isReady },
  //   );

  //test
  const numericCurrencyDataPrimaryOnlyPrice = currencyDataPrimaryOnlyPrice.map(
    (value) => parseFloat(value),
  );

  const numericCurrencyDataSecondaryOnlyPrice =
    currencyDataSecondaryOnlyPrice.map((value) => parseFloat(value));
  const numericCurrencyDataPrimaryOnlyVolume =
    currencyDataPrimaryOnlyVolume.map((value) => Number(value));
  const numericCurrencyDataSecondaryOnlyVolume =
    currencyDataSecondaryOnlyVolume.map((value) => Number(value));
  const numericCurrencyDataPrimaryOnlyMarketcap =
    currencyDataPrimaryOnlyMarketcap.map((value) => Number(value));
  const numericCurrencyDataSecondaryOnlyMarketcap =
    currencyDataSecondaryOnlyMarketcap.map((value) => Number(value));

  //list data
  const listData = datePrimary.reverse().map((date, index) => ({
    name: new Date(date).toLocaleDateString("en-GB"),
    value1: currencyDataPrimary[index]?.price,
    value4: currencyDataSecondary[index]?.price,
    value2: currencyDataPrimary[index]?.volume,
    value5: currencyDataSecondary[index]?.volume,
    value3: currencyDataPrimary[index]?.marketcap,
    value6: currencyDataSecondary[index]?.marketcap,
  }));
  //pobieranie
  const csvData = datePrimary.reverse().map((date, index) => ({
    date: new Date(date).toLocaleDateString("en-GB"),
    [`${name} Price`]: currencyDataPrimary[index]?.price,
    [`${name} Volume`]: currencyDataPrimary[index]?.volume,
    [`${name} marketcap`]: currencyDataPrimary[index]?.marketcap,
    [`${nameSecond} Price`]: currencyDataSecondary[index]?.price,
    [`${nameSecond} Volume`]: currencyDataSecondary[index]?.volume,
    [`${nameSecond} marketcap`]: currencyDataSecondary[index]?.marketcap,
  }));
  function convertToCSV(data) {
    const header = Object.keys(data[0]).join(",");
    const rows = data.map((obj) => Object.values(obj).join(","));
    return `${header}\n${rows.join("\n")}`;
  }

  function downloadCSV(data, filename) {
    const csvData = convertToCSV(data);
    const blob = new Blob([csvData], { type: "text/csv" });

    if (window.navigator.msSaveBlob) {
      // IE 10+
      window.navigator.msSaveBlob(blob, filename);
    } else {
      // Other browsers
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
  const handleDownloadClick = () => {
    downloadCSV(csvData, "data.csv");
  };

  //korelacja
  let correlation;

  if (currencyDataSecondary && currencyDataSecondary.length > 0) {
    correlation = ss.sampleCorrelation(
      numericCurrencyDataPrimaryOnlyPrice,
      numericCurrencyDataSecondaryOnlyPrice,
    );
  }
  //table
  let testData;
  if (numericCurrencyDataPrimaryOnlyPrice.length > 0) {
    testData = [
      {
        name: "Max",
        value1: ss.max(numericCurrencyDataPrimaryOnlyPrice).toFixed(2),
        value2: ss.max(numericCurrencyDataPrimaryOnlyVolume),
        value3: ss.max(numericCurrencyDataPrimaryOnlyMarketcap),
        value4:
          numericCurrencyDataSecondaryOnlyPrice.length > 0
            ? ss.max(numericCurrencyDataSecondaryOnlyPrice).toFixed(2)
            : null,
        value5:
          numericCurrencyDataSecondaryOnlyVolume.length > 0
            ? ss.max(numericCurrencyDataSecondaryOnlyVolume)
            : null,
        value6:
          numericCurrencyDataSecondaryOnlyMarketcap.length > 0
            ? ss.max(numericCurrencyDataSecondaryOnlyMarketcap)
            : null,
      },
    ];
  }
  let tableData = null;
  if (numericCurrencyDataPrimaryOnlyPrice.length > 0) {
    tableData = [
      {
        name: "Max",
        value1: ss.max(numericCurrencyDataPrimaryOnlyPrice).toFixed(2),
        value2: ss.max(numericCurrencyDataPrimaryOnlyVolume),
        value3: ss.max(numericCurrencyDataPrimaryOnlyMarketcap),
        value4:
          numericCurrencyDataSecondaryOnlyPrice.length > 0
            ? ss.max(numericCurrencyDataSecondaryOnlyPrice).toFixed(2)
            : null,
        value5:
          numericCurrencyDataSecondaryOnlyVolume.length > 0
            ? ss.max(numericCurrencyDataSecondaryOnlyVolume)
            : null,
        value6:
          numericCurrencyDataSecondaryOnlyMarketcap.length > 0
            ? ss.max(numericCurrencyDataSecondaryOnlyMarketcap)
            : null,
      },
      {
        name: "Min",
        value1: ss.min(numericCurrencyDataPrimaryOnlyPrice).toFixed(2),
        value2: ss.min(numericCurrencyDataPrimaryOnlyVolume),
        value3: ss.min(numericCurrencyDataPrimaryOnlyMarketcap),
        value4:
          numericCurrencyDataSecondaryOnlyPrice.length > 0
            ? ss.min(numericCurrencyDataSecondaryOnlyPrice).toFixed(2)
            : null,
        value5:
          numericCurrencyDataSecondaryOnlyVolume.length > 0
            ? ss.min(numericCurrencyDataSecondaryOnlyVolume)
            : null,
        value6:
          numericCurrencyDataSecondaryOnlyMarketcap.length > 0
            ? ss.min(numericCurrencyDataSecondaryOnlyMarketcap)
            : null,
      },
      {
        name: "Mean",
        value1: ss.mean(numericCurrencyDataPrimaryOnlyPrice).toFixed(2),
        value2: ss.mean(numericCurrencyDataPrimaryOnlyVolume),
        value3: ss.mean(numericCurrencyDataPrimaryOnlyMarketcap),
        value4:
          numericCurrencyDataSecondaryOnlyPrice.length > 0
            ? ss.mean(numericCurrencyDataSecondaryOnlyPrice).toFixed(2)
            : null,
        value5:
          numericCurrencyDataSecondaryOnlyVolume.length > 0
            ? ss.mean(numericCurrencyDataSecondaryOnlyVolume)
            : null,
        value6:
          numericCurrencyDataSecondaryOnlyMarketcap.length > 0
            ? ss.mean(numericCurrencyDataSecondaryOnlyMarketcap)
            : null,
      },
      {
        name: "Median",
        value1: ss.median(numericCurrencyDataPrimaryOnlyPrice).toFixed(2),
        value2: ss.median(numericCurrencyDataPrimaryOnlyVolume),
        value3: ss.median(numericCurrencyDataPrimaryOnlyMarketcap),
        value4:
          numericCurrencyDataSecondaryOnlyPrice.length > 0
            ? ss.median(numericCurrencyDataSecondaryOnlyPrice).toFixed(2)
            : null,
        value5:
          numericCurrencyDataSecondaryOnlyVolume.length > 0
            ? ss.median(numericCurrencyDataSecondaryOnlyVolume)
            : null,
        value6:
          numericCurrencyDataSecondaryOnlyMarketcap.length > 0
            ? ss.median(numericCurrencyDataSecondaryOnlyMarketcap)
            : null,
      },
      {
        name: "Quantile 25",
        value1: ss
          .quantile(numericCurrencyDataPrimaryOnlyPrice, 0.25)
          .toFixed(2),
        value2: ss.quantile(numericCurrencyDataPrimaryOnlyVolume, 0.25),
        value3: ss.quantile(numericCurrencyDataPrimaryOnlyMarketcap, 0.25),
        value4:
          numericCurrencyDataSecondaryOnlyPrice.length > 0
            ? ss
                .quantile(numericCurrencyDataSecondaryOnlyPrice, 0.25)
                .toFixed(2)
            : null,
        value5:
          numericCurrencyDataSecondaryOnlyVolume.length > 0
            ? ss.quantile(numericCurrencyDataSecondaryOnlyVolume, 0.25)
            : null,
        value6:
          numericCurrencyDataSecondaryOnlyMarketcap.length > 0
            ? ss.quantile(numericCurrencyDataSecondaryOnlyMarketcap, 0.25)
            : null,
      },
      {
        name: "Quantile 50",
        value1: ss
          .quantile(numericCurrencyDataPrimaryOnlyPrice, 0.5)
          .toFixed(2),
        value2: ss.quantile(numericCurrencyDataPrimaryOnlyVolume, 0.5),
        value3: ss.quantile(numericCurrencyDataPrimaryOnlyMarketcap, 0.5),
        value4:
          numericCurrencyDataSecondaryOnlyPrice.length > 0
            ? ss.quantile(numericCurrencyDataSecondaryOnlyPrice, 0.5).toFixed(2)
            : null,
        value5:
          numericCurrencyDataSecondaryOnlyVolume.length > 0
            ? ss.quantile(numericCurrencyDataSecondaryOnlyVolume, 0.5)
            : null,
        value6:
          numericCurrencyDataSecondaryOnlyMarketcap.length > 0
            ? ss.quantile(numericCurrencyDataSecondaryOnlyMarketcap, 0.5)
            : null,
      },
      {
        name: "Quantile 75",
        value1: ss
          .quantile(numericCurrencyDataPrimaryOnlyPrice, 0.75)
          .toFixed(2),
        value2: ss.quantile(numericCurrencyDataPrimaryOnlyVolume, 0.75),
        value3: ss.quantile(numericCurrencyDataPrimaryOnlyMarketcap, 0.75),
        value4:
          numericCurrencyDataSecondaryOnlyPrice.length > 0
            ? ss
                .quantile(numericCurrencyDataSecondaryOnlyPrice, 0.75)
                .toFixed(2)
            : null,
        value5:
          numericCurrencyDataSecondaryOnlyVolume.length > 0
            ? ss.quantile(numericCurrencyDataSecondaryOnlyVolume, 0.75)
            : null,
        value6:
          numericCurrencyDataSecondaryOnlyMarketcap.length > 0
            ? ss.quantile(numericCurrencyDataSecondaryOnlyMarketcap, 0.75)
            : null,
      },
      {
        name: "Std Dev",
        value1: ss
          .standardDeviation(numericCurrencyDataPrimaryOnlyPrice)
          .toFixed(2),
        value2: ss.standardDeviation(numericCurrencyDataPrimaryOnlyVolume),
        value3: ss.standardDeviation(numericCurrencyDataPrimaryOnlyMarketcap),
        value4:
          numericCurrencyDataSecondaryOnlyPrice.length > 0
            ? ss
                .standardDeviation(numericCurrencyDataSecondaryOnlyPrice)
                .toFixed(2)
            : null,
        value5:
          numericCurrencyDataSecondaryOnlyVolume.length > 0
            ? ss.standardDeviation(numericCurrencyDataSecondaryOnlyVolume)
            : null,
        value6:
          numericCurrencyDataSecondaryOnlyMarketcap.length > 0
            ? ss.standardDeviation(numericCurrencyDataSecondaryOnlyMarketcap)
            : null,
      },
      !isNaN(correlation) && {
        name: "Correlation",
        value1: correlation,
        value2: 1,
        value3: 1,
        value4: null,
        value5: null,
        value6: null,
      },
    ];
  }
  const tabs = [
    {
      title: "Prediction Chart",
      content: (
        <div>
          <CryptoChart
            data={predictionDataPrice}
            nameOne={name}
            nameTwo={nameSecond}
          />
        </div>
      ),
    },
    {
      title: "Basic Stats",
      content: (
        <div>
          {" "}
          <StatisticsTable
            data={tableData}
            columnName1="Statistic"
            columnName2={name + " price"}
            columnName3={name + " volume"}
            columnName4={name + " marketcap"}
            columnName5={nameSecond + " price"}
            columnName6={nameSecond + " volume"}
            columnName7={nameSecond + " marketcap"}
            enableSorting={false}
          />
        </div>
      ),
    },
    {
      title: "List",
      content: (
        <div>
          {" "}
          <Button
            className="rounded bg-blue-500 px-4 py-2 font-semibold text-white"
            onClick={handleDownloadClick}
          >
            download CSV
          </Button>
          <StatisticsTable
            data={listData}
            columnName1="Date"
            columnName2={name + " price"}
            columnName3={name + " volume"}
            columnName4={name + " marketcap"}
            columnName5={nameSecond + " price"}
            columnName6={nameSecond + " volume"}
            columnName7={nameSecond + " marketcap"}
            enableSorting={true}
          />
        </div>
      ),
    },
  ];
  //test2

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

      <p>Select other currency to compare:</p>
      <Dropdown
        excludedCurrencyId={currencyId}
        onDropdownChange={handleDropdownChange}
      />
      <Tab tabs={tabs} />
    </div>
  );
};

export default Analysys;
