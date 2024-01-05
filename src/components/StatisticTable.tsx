import React, { useMemo, useState } from "react";

const StatisticsTable = ({
  data,
  columnName1,
  columnName2,
  columnName3,
  columnName4,
  columnName5,
  columnName6,
  columnName7,
  scalingPercentage = 100,
  enableSorting = false,
}) => {
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sortType, setSortType] = useState<string | null>(null);

  const scaledStyle = {
    transform: `scale(${scalingPercentage / 100})`,
  };

  const sortedData = useMemo(() => {
    if (enableSorting && sortType) {
      return data.slice().sort((a, b) => {
        if (sortType === "date" && a.date && b.date) {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();

          return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        } else {
          const aValue = a[sortType];
          const bValue = b[sortType];

          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }
      });
    }

    return data;
  }, [data, sortDirection, sortType, enableSorting]);

  const handleSortChange = (type: string) => {
    if (type === sortType) {
      // zmien kierunek
      setSortDirection((prevDirection) =>
        prevDirection === "asc" ? "desc" : "asc",
      );
    } else {
      // reset
      setSortType(type);
      setSortDirection("asc");
    }
  };

  return (
    <table
      className="min-w-full divide-y divide-gray-300 border border-gray-300"
      style={scaledStyle}
    >
      <thead className="bg-gray-200">
        <tr>
          <th
            className="px-4 py-2 text-center"
            onClick={() => enableSorting && handleSortChange("date")}
            style={{ cursor: enableSorting ? "pointer" : "default" }}
          >
            {columnName1}
          </th>
          <th
            className="px-4 py-2 text-center"
            onClick={() => enableSorting && handleSortChange("value1")}
            style={{ cursor: enableSorting ? "pointer" : "default" }}
          >
            {columnName2}
          </th>
          <th
            className="px-4 py-2 text-center"
            onClick={() => enableSorting && handleSortChange("value2")}
            style={{ cursor: enableSorting ? "pointer" : "default" }}
          >
            {columnName3}
          </th>
          <th
            className="px-4 py-2 text-center"
            onClick={() => enableSorting && handleSortChange("value3")}
            style={{ cursor: enableSorting ? "pointer" : "default" }}
          >
            {columnName4}
          </th>
          {data?.[1]?.value4 !== null && data?.[1]?.value4 !== undefined && (
            <th
              className="px-4 py-2 text-center"
              onClick={() => enableSorting && handleSortChange("value4")}
              style={{ cursor: enableSorting ? "pointer" : "default" }}
            >
              {columnName5}
            </th>
          )}
          {data?.[1]?.value5 !== null && data?.[1]?.value5 !== undefined && (
            <th
              className="px-4 py-2 text-center"
              onClick={() => enableSorting && handleSortChange("value5")}
              style={{ cursor: enableSorting ? "pointer" : "default" }}
            >
              {columnName6}
            </th>
          )}
          {data?.[1]?.value6 !== null && data?.[1]?.value6 !== undefined && (
            <th
              className="px-4 py-2 text-center"
              onClick={() => enableSorting && handleSortChange("value6")}
              style={{ cursor: enableSorting ? "pointer" : "default" }}
            >
              {columnName7}
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {sortedData?.map((statistic, index) => (
          <tr key={index}>
            <td className="px-4 py-2 text-center">{statistic.name}</td>
            <td className="px-4 py-2 text-center">{statistic.value1}</td>
            <td className="px-4 py-2 text-center">{statistic.value2}</td>
            <td className="px-4 py-2 text-center">{statistic.value3}</td>
            {statistic.value4 !== undefined && (
              <td className="px-4 py-2 text-center">{statistic.value4}</td>
            )}
            {statistic.value5 !== undefined && (
              <td className="px-4 py-2 text-center">{statistic.value5}</td>
            )}
            {statistic.value6 !== undefined && (
              <td className="px-4 py-2 text-center">{statistic.value6}</td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StatisticsTable;
