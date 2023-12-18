import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface DataPoint {
  name: string;
  uv: number;
  pv: number;
  amt: number;
}

interface CryptoChartProps {
  data: DataPoint[];
  nameOne: string;
  nameTwo: string;
}

const CryptoChart: React.FC<CryptoChartProps> = ({
  data,
  nameOne,
  nameTwo,
}) => {
  return (
    <LineChart
      width={500}
      height={300}
      data={data}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line
        type="monotone"
        dataKey="main"
        stroke="#8884d8"
        activeDot={{ r: 8 }}
        name={nameOne}
      />
      <Line
        type="monotone"
        dataKey="secondary"
        stroke="#82ca9d"
        name={nameTwo}
      />
    </LineChart>
  );
};

export default CryptoChart;
