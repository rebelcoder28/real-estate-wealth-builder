
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { formatCurrency, formatPercentage } from '@/utils/calculatorUtils';

interface InsightsPanelProps {
  crossoverMonth: number;
  monthlyBuyPayment: number;
  monthlyRentPayment: number;
  equityAfterFiveYears: number;
  taxBenefits: number;
  breakEvenPoint: number;
  className?: string;
}

const InsightsPanel = ({
  crossoverMonth,
  monthlyBuyPayment,
  monthlyRentPayment,
  equityAfterFiveYears,
  taxBenefits,
  breakEvenPoint,
  className = "",
}: InsightsPanelProps) => {
  const paymentDifference = monthlyBuyPayment - monthlyRentPayment;
  const paymentDifferenceText = paymentDifference >= 0
    ? `${formatCurrency(paymentDifference)} more per month`
    : `${formatCurrency(Math.abs(paymentDifference))} less per month`;

  const crossoverYears = Math.floor(crossoverMonth / 12);
  const crossoverMonths = crossoverMonth % 12;
  const crossoverText = crossoverMonth > 0
    ? `${crossoverYears} ${crossoverYears === 1 ? 'year' : 'years'}${crossoverMonths > 0 ? ` and ${crossoverMonths} ${crossoverMonths === 1 ? 'month' : 'months'}` : ''}`
    : 'Immediate';

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl text-sba-primary">
          <Lightbulb className="w-5 h-5 mr-2" />
          Key Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium text-gray-800">Buying vs. Renting</h3>
          <p className="text-sm text-gray-600">
            Initially, buying will cost <span className="font-semibold">{paymentDifferenceText}</span> compared to renting.
          </p>
          <p className="text-sm text-gray-600">
            Buying becomes cheaper than renting after <span className="font-semibold">{crossoverText}</span>, when accounting for equity building and tax benefits.
          </p>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium text-gray-800">Equity Building</h3>
          <p className="text-sm text-gray-600">
            After 5 years, you'll have built approximately <span className="font-semibold">{formatCurrency(equityAfterFiveYears)}</span> in equity.
          </p>
          <p className="text-sm text-gray-600">
            Your break-even point (when equity equals initial investment) occurs in approximately <span className="font-semibold">{breakEvenPoint}</span> months.
          </p>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium text-gray-800">Tax Benefits</h3>
          <p className="text-sm text-gray-600">
            Your tax benefits average approximately <span className="font-semibold">{formatCurrency(taxBenefits)}</span> per month in the first year.
          </p>
          <p className="text-sm text-gray-600">
            These benefits effectively reduce your monthly payment by about <span className="font-semibold">{formatPercentage((taxBenefits / monthlyBuyPayment) * 100)}</span>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightsPanel;
