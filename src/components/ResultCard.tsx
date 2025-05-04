
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResultCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  valueClassName?: string;
}

const ResultCard = ({
  title,
  value,
  subtitle,
  icon,
  className = "",
  valueClassName = "",
}: ResultCardProps) => {
  return (
    <Card className={`sba-card ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-base font-medium text-gray-700">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClassName}`}>{value}</div>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
};

export default ResultCard;
