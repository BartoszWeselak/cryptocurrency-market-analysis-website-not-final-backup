import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useMemo } from "react";
import Dropdown from "~/components/Dropdown";

import LinearRegression from "~/components/LinearRegression";
import Tab from "~/components/Tab";

import Layout from "~/components/layout/layout";
//import CryptoChart from "~/components/CryptoChart";
import { api } from "~/utils/api";
import MultipleLinearRegression from "~/components/MultipleLinearRegression";

import Statistics from "~/components/Statistics";
import TestModel from "~/components/TestModel";

const CryptoChart = dynamic(() => import("~/components/CryptoChart"), {
  ssr: false,
});

const CryptoPage = () => {
  const getAllCurrenciesQuery = api.currency.getAllCurrencies.useQuery();

  const router = useRouter();
  const cryptoId = router.query.cryptoId as string;
  const { isLoading, data, isError } = api.currency.getCurrencyById.useQuery(
    { id: parseInt(cryptoId) },
    { enabled: router.isReady },
  );
  const secondary = api.currency.getCurrencyByName.useQuery(
    { name: "ethereum" },
    { enabled: router.isReady },
  );

  const currencyDataSecondary =
    secondary?.data?.snapshots.map((snapshot) => snapshot.price.toFixed(2)) ||
    [];

  const currencyDataPrice = useMemo(() => {
    if (data && data.snapshots) {
      return data.snapshots.map((snapshot, index) => ({
        date: snapshot.snapshotDate.toDateString(),
        secondary: currencyDataSecondary[index],
        main: snapshot.price.toFixed(2),
        amt: null,
      }));
    }
    return [];
  }, [data]);

  const currencyData = useMemo(() => {
    if (data && data.snapshots) {
      return data.snapshots.map((snapshot, index) => ({
        date: snapshot.snapshotDate.toDateString(),
        main: snapshot.price,
      }));
    }
    return [];
  }, [data]);

  //testowe

  const name = data?.name;
  const nameSecond = secondary?.data?.name;

  //do optymalizacji
  const currencyDataForMultipleLinearRegression = useMemo(() => {
    if (data && data.snapshots) {
      return data.snapshots.map((snapshot, index) => ({
        price: snapshot.price,
        volumen: snapshot.volumen,
        marketCap: snapshot.marketCap,
        date: snapshot.snapshotDate.toDateString(),
      }));
    }
    return [];
  }, [data]);
  //
  const tabs = [
    {
      title: "Main",
      content: (
        <div>
          <p>Crypto ID: {cryptoId}</p>
          <p>Crypto Name: {name}</p>
        </div>
      ),
    },

    {
      title: "Chart",
      content: (
        <div>
          <CryptoChart
            data={currencyDataPrice}
            nameOne={name}
            nameTwo={nameSecond}
          />
        </div>
      ),
    },

    {
      title: "Analysis",
      content: <TestModel currencyId={cryptoId} />,
    },
  ];
  //
  return (
    <Layout>
      <Tab tabs={tabs} />
    </Layout>
  );
};

export default CryptoPage;
