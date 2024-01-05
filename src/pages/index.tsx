import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { TextField } from "~/components/TextField";
import CryptoTable from "~/components/CryptoTable";
import Layout from "~/components/layout/layout";
import { api } from "~/utils/api";
import { CryptoTableProps } from "~/components/CryptoTable";
import Modal from "~/components/Modal";
import Tab from "~/components/Tab";

export default function Home() {
  const ses = useSession();

  const { isLoading, isFetching, isError, data } = ses.data?.user.id
    ? api.currency.getLatestDayCurrenciesSnapshots.useQuery()
    : api.currency.getLatestDayCurrenciesSnapshotsNoFavourite.useQuery();

  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const favData = api.currency.getFavouriteCurrencies.useQuery();

  const memoizedData = useMemo(() => {
    if (data) {
      return data.map((l) => {
        return {
          isFavourite: l.isFavourite,
          currency: {
            id: l.id,
            name: l.name,
          },
          snapshot: {
            id: l.snapshots[0]?.id,
            marketCap: l.snapshots[0]?.marketCap,
            price: l.snapshots[0]?.price.toFixed(2),
            snapshotDate: l.snapshots[0]?.snapshotDate,
            volumen: l.snapshots[0]?.volumen,
          },
        };
      });
    }
    return [];
  }, [data]);

  //fetch
  // useEffect(() => {
  //   fetch("/api/test")
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log("data");
  //       console.log(data);
  //     })
  //     .catch((error) => {
  //       console.error("Error:", error);
  //     });
  // }, []);

  const memoizedFavData = useMemo(() => {
    if (favData.data) {
      return favData.data.map((l) => {
        return {
          isFavourite: l.isFavourite,
          currency: {
            id: l.id,
            name: l.name,
          },
          snapshot: {
            id: l.snapshots[0]?.id,
            marketCap: l.snapshots[0]?.marketCap,
            price: l.snapshots[0]?.price.toFixed(2),
            snapshotDate: l.snapshots[0]?.snapshotDate,
            volumen: l.snapshots[0]?.volumen,
          },
        };
      });
    }
    return [];
  }, [favData.data]);

  //test
  const tabs = [
    {
      title: "Main",
      content: (
        <div>
          {" "}
          {isLoading ? (
            "loading"
          ) : isError ? (
            "error"
          ) : !data?.length ? (
            "is empty"
          ) : (
            <CryptoTable data={memoizedData} />
          )}
        </div>
      ),
    },
    {
      title: "Favourite",
      content: (
        <div>
          {favData.isLoading ? (
            "loading"
          ) : favData.isError ? (
            "error"
          ) : !favData.data.length ? (
            "is empty"
          ) : (
            <CryptoTable data={memoizedFavData} />
          )}
        </div>
      ),
    },
  ];
  //

  return (
    <>
      <Layout>
        <Tab tabs={tabs} />
      </Layout>
    </>
  );
}
