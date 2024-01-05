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
import Analysys from "~/components/Analysys";

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

  //testowe

  const name = data?.name;
  const nameSecond = secondary?.data?.name;

  //do optymalizacji
  //

  //
  return (
    <Layout>
      {/* <TestModel currencyId={cryptoId} /> */}
      <Analysys currencyId={cryptoId} />
    </Layout>
  );
};

export default CryptoPage;
