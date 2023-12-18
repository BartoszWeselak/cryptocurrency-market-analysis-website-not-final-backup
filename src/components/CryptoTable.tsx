import React, { useMemo, useState } from "react";
import { FaReact } from "react-icons/fa";
import Link from "next/link";
import type { Currency, CurrencySnapshot } from "@prisma/client";
import AddFavouriteCurrencyButton from "./AddFavouriteCurrencyButton";
import { FaSearch } from "react-icons/fa";
import { useSession } from "next-auth/react";

export type CryptoTableProps = {
  data: {
    currency: Pick<Currency, "id" | "name">;
    snapshot: Omit<CurrencySnapshot, "currencyId">;
    isFavourite: boolean;
  }[];
};

const CryptoTable: React.FC<CryptoTableProps> = ({ data }) => {
  const [filter, setFilter] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sortType, setSortType] = useState<"price" | "volumen" | "marketCap">(
    "price",
  );
  const { data: session } = useSession();

  const sortedData = useMemo(() => {
    return data.slice().sort((a, b) => {
      if (sortType === "price") {
        if (sortDirection === "asc") {
          return a.snapshot.price - b.snapshot.price;
        } else {
          return b.snapshot.price - a.snapshot.price;
        }
      } else if (sortType === "volumen") {
        if (sortDirection === "asc") {
          return Number(a.snapshot.volumen) - Number(b.snapshot.volumen);
        } else {
          return Number(b.snapshot.volumen) - Number(a.snapshot.volumen);
        }
      } else if (sortType === "marketCap") {
        if (sortDirection === "asc") {
          return Number(a.snapshot.marketCap) - Number(b.snapshot.marketCap);
        } else {
          return Number(b.snapshot.marketCap) - Number(a.snapshot.marketCap);
        }
      }
      return 0;
    });
  }, [data, sortDirection, sortType]);

  const filteredData = useMemo(() => {
    return sortedData.filter((item) =>
      item.currency.name.toLowerCase().includes(filter.toLowerCase()),
    );
  }, [sortedData, filter]);

  const handleChangeSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const handleSortChange = (type: "price" | "volumen" | "marketCap") => {
    setSortType(type);
  };

  return (
    <div className="w-full ">
      <input
        type="text"
        placeholder="Filter by name"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <table className="mx-auto w-11/12 table-auto text-center">
        <thead>
          <tr className="h-8 w-full border-b-2  bg-gray-200 p-4 ">
            <th>Lp</th>
            <th>Name</th>
            <th
              onClick={() => {
                handleSortChange("price");
                handleChangeSortDirection();
              }}
              style={{ cursor: "pointer" }}
            >
              Price
            </th>
            <th
              onClick={() => {
                handleSortChange("volumen");
                handleChangeSortDirection();
              }}
              style={{ cursor: "pointer" }}
            >
              Volumen
            </th>
            <th
              onClick={() => {
                handleSortChange("marketCap");
                handleChangeSortDirection();
              }}
              style={{ cursor: "pointer" }}
            >
              Market Capitalization
            </th>
            <th>Other</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(
            ({ currency, snapshot, isFavourite }, currencyIdx) => (
              <tr key={currency.id} className="border-b-2 ">
                <td>{currencyIdx + 1}</td>
                <td>{currency.name} </td>
                <td>{snapshot.price} USD</td>
                <td>{Number(snapshot.volumen)} USD</td>
                <td>{Number(snapshot.marketCap)} USD</td>
                <td>
                  <Link href={`/crypto/${currency.id}`}>
                    <FaSearch />{" "}
                  </Link>
                  {session && (
                    <AddFavouriteCurrencyButton
                      id={currency.id}
                      isFavourite={isFavourite}
                    />
                  )}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
};

CryptoTable.displayName = "CryptoTable";

export default CryptoTable;
