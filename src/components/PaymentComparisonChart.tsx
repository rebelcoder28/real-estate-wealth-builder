
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/utils/calculatorUtils';

interface PaymentData {
  month: number;
  buyPayment: number;
  rentPayment: number;
}

interface PaymentComparisonChartProps {
  data: PaymentData[];
  className?: string;
}

const PaymentComparisonChart = ({ data, className = "" }: PaymentComparisonChartProps) => {
  return (
    <div className={`w-full h-64 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis
            dataKey="month"
            tickFormatter={(month) => `Year ${Math.floor(month / 12)}`}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(value) => formatCurrency(value).replace('.00', '')}
            width={80}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={(month) => `Month ${month} (Year ${Math.floor(month / 12)})`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="buyPayment"
            name="Monthly Ownership Cost"
            stroke="#1E5AA8"
            strokeWidth={2}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="rentPayment"
            name="Monthly Rent"
            stroke="#FF8A00"
            strokeWidth={2}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentComparisonChart;
