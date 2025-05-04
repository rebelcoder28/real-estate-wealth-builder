
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DollarSign, ChartBar, Home, TrendingUp } from "lucide-react";
import InputSlider from './InputSlider';
import SelectDropdown from './SelectDropdown';
import ResultCard from './ResultCard';
import PaymentComparisonChart from './PaymentComparisonChart';
import EquityBuildingChart from './EquityBuildingChart';
import InsightsPanel from './InsightsPanel';
import { 
  calculateMonthlyPayment,
  calculateMonthlyRentOverTime,
  calculateEquity,
  calculateMonthlyTaxBenefit,
  calculateCrossoverPoint,
  formatCurrency,
  formatPercentage
} from '@/utils/calculatorUtils';

const propertyTypes = [
  { value: 'office', label: 'Office' },
  { value: 'retail', label: 'Retail' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'mixed-use', label: 'Mixed-Use' }
];

const mortgageTerms = [
  { value: '7', label: '7 Years' },
  { value: '10', label: '10 Years' },
  { value: '25', label: '25 Years' }
];

const SBACalculator = () => {
  // Property details state
  const [purchasePrice, setPurchasePrice] = useState(1000000);
  const [propertyType, setPropertyType] = useState('office');
  const [appreciationRate, setAppreciationRate] = useState(2);
  
  // Loan structure state
  const [downPaymentPercent, setDownPaymentPercent] = useState(10);
  const [firstMortgageRate, setFirstMortgageRate] = useState(6);
  const [sbaRate, setSbaRate] = useState(5);
  const [firstMortgageTerm, setFirstMortgageTerm] = useState('10');
  
  // Rental comparison state
  const [monthlyRent, setMonthlyRent] = useState(5000);
  const [annualRentIncrease, setAnnualRentIncrease] = useState(3);
  
  // Business details state
  const [occupancyPeriod, setOccupancyPeriod] = useState(10);
  const [taxBracket, setTaxBracket] = useState(25);
  
  // Additional params with defaults
  const propertyTaxRate = 1.1; // 1.1% of property value annually
  const insuranceRate = 0.5; // 0.5% of property value annually
  
  // Derived values
  const downPayment = purchasePrice * (downPaymentPercent / 100);
  const firstMortgageAmount = purchasePrice * 0.5; // 50% of purchase price
  const sbaAmount = purchasePrice * 0.4; // 40% of purchase price
  const sbaTerm = 25; // Fixed at 25 years for real estate
  
  // Calculate monthly payments
  const firstMortgagePayment = calculateMonthlyPayment(
    firstMortgageAmount, 
    firstMortgageRate, 
    parseInt(firstMortgageTerm)
  );
  const sbaPayment = calculateMonthlyPayment(sbaAmount, sbaRate, sbaTerm);
  
  // Calculate monthly property tax and insurance
  const monthlyPropertyTax = (purchasePrice * (propertyTaxRate / 100)) / 12;
  const monthlyInsurance = (purchasePrice * (insuranceRate / 100)) / 12;
  
  // Calculate total monthly payment for buying
  const totalMonthlyPayment = firstMortgagePayment + sbaPayment + monthlyPropertyTax + monthlyInsurance;
  
  // Calculate average monthly tax benefit for the first year
  const [averageMonthlyTaxBenefit, setAverageMonthlyTaxBenefit] = useState(0);
  
  // Calculate effective monthly payment after tax benefits
  const effectiveMonthlyPayment = totalMonthlyPayment - averageMonthlyTaxBenefit;
  
  // Calculate crossover point
  const [crossoverMonth, setCrossoverMonth] = useState(0);
  
  // Calculate equity after 5 years
  const [equityAfterFiveYears, setEquityAfterFiveYears] = useState(0);
  
  // Calculate break-even point
  const [breakEvenMonth, setBreakEvenMonth] = useState(0);
  
  // Data for charts
  const [paymentComparisonData, setPaymentComparisonData] = useState<Array<any>>([]);
  const [equityBuildingData, setEquityBuildingData] = useState<Array<any>>([]);
  
  // Update derived values when inputs change
  useEffect(() => {
    // Calculate average monthly tax benefit for the first year
    let totalTaxBenefit = 0;
    for (let month = 1; month <= 12; month++) {
      totalTaxBenefit += calculateMonthlyTaxBenefit(
        purchasePrice,
        purchasePrice * 0.8, // Assuming building value is 80% of purchase price
        firstMortgageAmount,
        firstMortgageRate,
        sbaAmount,
        sbaRate,
        propertyTaxRate,
        taxBracket,
        month
      );
    }
    const monthlyAverage = totalTaxBenefit / 12;
    setAverageMonthlyTaxBenefit(monthlyAverage);
    
    // Calculate crossover point
    const crossover = calculateCrossoverPoint(
      purchasePrice,
      downPayment,
      firstMortgageAmount,
      firstMortgageRate,
      parseInt(firstMortgageTerm),
      sbaAmount,
      sbaRate,
      sbaTerm,
      monthlyRent,
      annualRentIncrease,
      propertyTaxRate,
      insuranceRate,
      taxBracket,
      appreciationRate
    );
    setCrossoverMonth(crossover);
    
    // Calculate equity after 5 years (60 months)
    const equityAt5Years = calculateEquity(
      purchasePrice,
      downPayment,
      firstMortgageAmount,
      firstMortgageRate,
      parseInt(firstMortgageTerm),
      sbaAmount,
      sbaRate,
      sbaTerm,
      appreciationRate,
      60
    );
    setEquityAfterFiveYears(equityAt5Years);
    
    // Calculate break-even month (when equity equals down payment)
    let beMonth = 0;
    for (let month = 1; month <= 360; month++) {
      const equity = calculateEquity(
        purchasePrice,
        downPayment,
        firstMortgageAmount,
        firstMortgageRate,
        parseInt(firstMortgageTerm),
        sbaAmount,
        sbaRate,
        sbaTerm,
        appreciationRate,
        month
      );
      if (equity >= downPayment * 2) {
        beMonth = month;
        break;
      }
    }
    setBreakEvenMonth(beMonth);
    
    // Generate payment comparison data for chart
    const paymentData = [];
    const years = Math.min(occupancyPeriod, 30);
    for (let month = 0; month <= years * 12; month += 6) {
      const currentRent = calculateMonthlyRentOverTime(monthlyRent, annualRentIncrease, month);
      
      // Calculate tax benefit for this month
      const taxBenefit = month === 0 ? 0 : calculateMonthlyTaxBenefit(
        purchasePrice,
        purchasePrice * 0.8,
        firstMortgageAmount,
        firstMortgageRate,
        sbaAmount,
        sbaRate,
        propertyTaxRate,
        taxBracket,
        month
      );
      
      paymentData.push({
        month,
        buyPayment: totalMonthlyPayment - taxBenefit,
        rentPayment: currentRent
      });
    }
    setPaymentComparisonData(paymentData);
    
    // Generate equity building data for chart
    const equityData = [];
    for (let year = 0; year <= Math.min(occupancyPeriod, 30); year += 1) {
      const months = year * 12;
      const equity = calculateEquity(
        purchasePrice,
        downPayment,
        firstMortgageAmount,
        firstMortgageRate,
        parseInt(firstMortgageTerm),
        sbaAmount,
        sbaRate,
        sbaTerm,
        appreciationRate,
        months
      );
      
      // Calculate principal paid
      const firstMortgagePrincipalPaid = year === 0 ? 0 : calculatePrincipalPaid(
        firstMortgageAmount,
        firstMortgageRate,
        parseInt(firstMortgageTerm),
        months
      );
      
      const sbaPrincipalPaid = year === 0 ? 0 : calculatePrincipalPaid(
        sbaAmount,
        sbaRate,
        sbaTerm,
        months
      );
      
      const principalPaid = firstMortgagePrincipalPaid + sbaPrincipalPaid;
      
      // Calculate appreciation
      const appreciation = year === 0 ? 0 : equity - downPayment - principalPaid;
      
      equityData.push({
        year,
        downPayment: year === 0 ? downPayment : downPayment,
        principalPaid: principalPaid,
        appreciation: appreciation,
      });
    }
    setEquityBuildingData(equityData);
  }, [
    purchasePrice,
    propertyType,
    appreciationRate,
    downPaymentPercent,
    firstMortgageRate,
    sbaRate,
    firstMortgageTerm,
    monthlyRent,
    annualRentIncrease,
    occupancyPeriod,
    taxBracket,
    firstMortgageAmount,
    sbaAmount,
    totalMonthlyPayment,
  ]);
  
  // Helper function for principal paid calculation that should have been in the utils
  const calculatePrincipalPaid = (
    principal: number,
    interestRate: number,
    termYears: number,
    months: number
  ): number => {
    // Ensure months doesn't exceed term
    const monthsToCalculate = Math.min(months, termYears * 12);
    
    // Convert annual interest rate to monthly decimal
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = termYears * 12;
    
    // Handle edge case of zero interest rate
    if (monthlyRate === 0) {
      return (principal / totalPayments) * monthsToCalculate;
    }
    
    const monthlyPayment = calculateMonthlyPayment(principal, interestRate, termYears);
    let remainingPrincipal = principal;
    let principalPaid = 0;
    
    for (let i = 0; i < monthsToCalculate; i++) {
      const interestPayment = remainingPrincipal * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      
      principalPaid += principalPayment;
      remainingPrincipal -= principalPayment;
    }
    
    return principalPaid;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-sba-primary">SBA 504 Real Estate Loan Calculator</h1>
        <p className="text-gray-600 mt-2">Compare buying commercial real estate with an SBA 504 loan versus renting</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Inputs */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="property">
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="property">Property</TabsTrigger>
                  <TabsTrigger value="loan">Loan</TabsTrigger>
                  <TabsTrigger value="rent">Rent</TabsTrigger>
                  <TabsTrigger value="business">Business</TabsTrigger>
                </TabsList>
                
                <TabsContent value="property" className="space-y-4">
                  <h3 className="sba-section-title">Property Details</h3>
                  <InputSlider
                    label="Purchase Price"
                    min={100000}
                    max={15000000}
                    step={10000}
                    value={purchasePrice}
                    onChange={setPurchasePrice}
                    formatValue={formatCurrency}
                    formatLabel={formatCurrency}
                  />
                  
                  <SelectDropdown
                    label="Property Type"
                    options={propertyTypes}
                    value={propertyType}
                    onChange={setPropertyType}
                  />
                  
                  <InputSlider
                    label="Estimated Annual Appreciation"
                    min={0}
                    max={7}
                    step={0.1}
                    value={appreciationRate}
                    onChange={setAppreciationRate}
                    formatValue={formatPercentage}
                    formatLabel={formatPercentage}
                    unit="%"
                  />
                </TabsContent>
                
                <TabsContent value="loan" className="space-y-4">
                  <h3 className="sba-section-title">Loan Structure</h3>
                  <InputSlider
                    label="Down Payment Percentage"
                    min={10}
                    max={25}
                    step={0.5}
                    value={downPaymentPercent}
                    onChange={setDownPaymentPercent}
                    formatValue={formatPercentage}
                    formatLabel={formatPercentage}
                    unit="%"
                  />
                  
                  <div className="p-4 bg-gray-50 rounded-md mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">First Mortgage (50%)</span>
                      <span className="text-sm font-semibold">{formatCurrency(firstMortgageAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">SBA/CDC Portion (40%)</span>
                      <span className="text-sm font-semibold">{formatCurrency(sbaAmount)}</span>
                    </div>
                  </div>
                  
                  <InputSlider
                    label="First Mortgage Interest Rate"
                    min={3}
                    max={12}
                    step={0.125}
                    value={firstMortgageRate}
                    onChange={setFirstMortgageRate}
                    formatValue={formatPercentage}
                    formatLabel={formatPercentage}
                    unit="%"
                  />
                  
                  <InputSlider
                    label="SBA/CDC Loan Interest Rate"
                    min={2}
                    max={8}
                    step={0.125}
                    value={sbaRate}
                    onChange={setSbaRate}
                    formatValue={formatPercentage}
                    formatLabel={formatPercentage}
                    unit="%"
                  />
                  
                  <SelectDropdown
                    label="First Mortgage Term"
                    options={mortgageTerms}
                    value={firstMortgageTerm}
                    onChange={setFirstMortgageTerm}
                  />
                  
                  <div className="p-4 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">SBA/CDC Term</span>
                      <span className="text-sm font-semibold">25 Years</span>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="rent" className="space-y-4">
                  <h3 className="sba-section-title">Rental Comparison</h3>
                  <InputSlider
                    label="Current Monthly Rent"
                    min={1000}
                    max={50000}
                    step={500}
                    value={monthlyRent}
                    onChange={setMonthlyRent}
                    formatValue={formatCurrency}
                    formatLabel={formatCurrency}
                  />
                  
                  <InputSlider
                    label="Expected Annual Rent Increase"
                    min={0}
                    max={10}
                    step={0.5}
                    value={annualRentIncrease}
                    onChange={setAnnualRentIncrease}
                    formatValue={formatPercentage}
                    formatLabel={formatPercentage}
                    unit="%"
                  />
                </TabsContent>
                
                <TabsContent value="business" className="space-y-4">
                  <h3 className="sba-section-title">Business Details</h3>
                  <InputSlider
                    label="Expected Occupancy Period"
                    min={1}
                    max={30}
                    value={occupancyPeriod}
                    onChange={setOccupancyPeriod}
                    formatValue={(val) => `${val} years`}
                    formatLabel={(val) => `${val} yrs`}
                  />
                  
                  <InputSlider
                    label="Tax Bracket"
                    min={15}
                    max={37}
                    step={1}
                    value={taxBracket}
                    onChange={setTaxBracket}
                    formatValue={formatPercentage}
                    formatLabel={formatPercentage}
                    unit="%"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Center Panel - Results */}
        <div className="lg:col-span-1">
          <div className="grid grid-cols-1 gap-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <ResultCard
                title="Monthly Payment"
                value={formatCurrency(effectiveMonthlyPayment)}
                subtitle="After tax benefits"
                icon={<DollarSign className="w-4 h-4" />}
                valueClassName="text-sba-primary"
              />
              <ResultCard
                title="Monthly Rent"
                value={formatCurrency(monthlyRent)}
                subtitle="Current rate"
                icon={<Home className="w-4 h-4" />}
                valueClassName="text-sba-accent"
              />
            </div>
            
            <ResultCard
              title="Break-Even Point"
              value={`${Math.floor(crossoverMonth / 12)} years, ${crossoverMonth % 12} months`}
              subtitle="When buying becomes cheaper than renting"
              icon={<TrendingUp className="w-4 h-4" />}
              valueClassName="text-sba-secondary"
            />
            
            <ResultCard
              title="Equity Built (5 Years)"
              value={formatCurrency(equityAfterFiveYears)}
              subtitle={`${formatCurrency(equityAfterFiveYears - downPayment)} increase from down payment`}
              icon={<ChartBar className="w-4 h-4" />}
              valueClassName="text-sba-secondary"
            />
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Monthly Payment Comparison</h3>
                <PaymentComparisonChart data={paymentComparisonData} />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Equity Building Over Time</h3>
                <EquityBuildingChart data={equityBuildingData} />
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Right Panel - Insights */}
        <div className="lg:col-span-1">
          <InsightsPanel
            crossoverMonth={crossoverMonth}
            monthlyBuyPayment={effectiveMonthlyPayment}
            monthlyRentPayment={monthlyRent}
            equityAfterFiveYears={equityAfterFiveYears}
            taxBenefits={averageMonthlyTaxBenefit}
            breakEvenPoint={breakEvenMonth}
          />
          
          <Card className="mt-4">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Payment Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">First Mortgage Payment</span>
                  <span className="font-medium">{formatCurrency(firstMortgagePayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">SBA/CDC Payment</span>
                  <span className="font-medium">{formatCurrency(sbaPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Property Tax</span>
                  <span className="font-medium">{formatCurrency(monthlyPropertyTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Insurance</span>
                  <span className="font-medium">{formatCurrency(monthlyInsurance)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Monthly Payment</span>
                  <span className="font-medium">{formatCurrency(totalMonthlyPayment)}</span>
                </div>
                <div className="flex justify-between bg-gray-50 p-2 rounded-md">
                  <span className="text-sm text-gray-600">Tax Benefits</span>
                  <span className="font-medium text-sba-secondary">-{formatCurrency(averageMonthlyTaxBenefit)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Effective Monthly Payment</span>
                  <span className="font-semibold text-sba-primary">{formatCurrency(effectiveMonthlyPayment)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>This calculator provides estimates only. Consult with financial professionals for accurate guidance.</p>
      </div>
    </div>
  );
};

export default SBACalculator;
