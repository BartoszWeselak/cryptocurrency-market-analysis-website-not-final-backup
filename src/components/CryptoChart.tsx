import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
} from "recharts";

interface DataPoint {
  name: string;
  main: number;
  volumeMain: number;
  secondary: number;
  amt: number;
}

interface CryptoChartProps {
  data: DataPoint[];
  nameOne: string;
  nameTwo: string;
}

// Pusty komponent dot
const EmptyDot: React.FC = () => null;

const CryptoChart: React.FC<CryptoChartProps> = ({
  data,
  nameOne,
  nameTwo,
}) => {
  const [chartWidth, setChartWidth] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      setChartWidth(window.innerWidth * 0.8);
    };

    setChartWidth(window.innerWidth * 0.8);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <LineChart width={chartWidth} height={600} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip
        content={({ payload }) => {
          if (payload && payload.length) {
            const mainValue = payload[0].payload.main;
            const volumeMainValue = payload[0].payload.volumeMain;
            const marketcapMainValue = payload[0].payload.marketcapMain;
            const secondaryValue = payload[0].payload.secondary;
            const volumeSecondaryValue = payload[0].payload.volumeSecondary;
            const marketcapSecondaryValue =
              payload[0].payload.marketcapSecondary;

            return (
              <div>
                {mainValue !== undefined && !isNaN(mainValue) && (
                  <>
                    <p style={{ color: "#8884d8" }}>{nameOne}</p>
                    <p style={{ color: "#8884d8" }}>Price: {mainValue} USD</p>
                  </>
                )}
                {volumeMainValue !== undefined && !isNaN(volumeMainValue) && (
                  <p style={{ color: "#8884d8" }}>
                    Volume: {volumeMainValue} USD
                  </p>
                )}
                {marketcapMainValue !== undefined &&
                  !isNaN(marketcapMainValue) && (
                    <p style={{ color: "#8884d8" }}>
                      marketCap: {marketcapMainValue} USD
                    </p>
                  )}
                <br />
                {secondaryValue !== undefined && !isNaN(secondaryValue) && (
                  <>
                    <p style={{ color: "#82ca9d" }}>{nameTwo}</p>
                    <p style={{ color: "#82ca9d" }}>
                      Price: {secondaryValue} USD
                    </p>
                  </>
                )}
                {volumeSecondaryValue !== undefined &&
                  !isNaN(volumeSecondaryValue) && (
                    <p style={{ color: "#82ca9d" }}>
                      Volume: {volumeSecondaryValue} USD
                    </p>
                  )}
                {marketcapSecondaryValue !== undefined &&
                  !isNaN(marketcapSecondaryValue) && (
                    <p style={{ color: "#82ca9d" }}>
                      marketCap: {marketcapSecondaryValue} USD
                    </p>
                  )}
              </div>
            );
          }
          return null;
        }}
      />
      <Tooltip />
      <Legend />
      <Brush dataKey="name" height={30} stroke="#8884d8" />
      <Line
        type="monotone"
        dataKey="main"
        stroke="#8884d8"
        activeDot={{ r: 8 }}
        name={nameOne}
        dot={<EmptyDot />}
      />

      <Line
        type="monotone"
        dataKey="secondary"
        stroke="#82ca9d"
        name={nameTwo}
        dot={<EmptyDot />}
      />
    </LineChart>
  );
};

export default CryptoChart;
