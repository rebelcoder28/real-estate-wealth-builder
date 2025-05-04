
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/utils/calculatorUtils';

interface EquityData {
  year: number;
  downPayment: number;
  principalPaid: number;
  appreciation: number;
}

interface EquityBuildingChartProps {
  data: EquityData[];
  className?: string;
}

const EquityBuildingChart = ({ data, className = "" }: EquityBuildingChartProps) => {
  return (
    <div className={`w-full h-64 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis tickFormatter={(value) => formatCurrency(value).replace('.00', '')} width={80} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
          <Bar dataKey="downPayment" name="Down Payment" stackId="a" fill="#1E5AA8" />
          <Bar dataKey="principalPaid" name="Principal Paid" stackId="a" fill="#3BA853" />
          <Bar dataKey="appreciation" name="Appreciation" stackId="a" fill="#FF8A00" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EquityBuildingChart;
