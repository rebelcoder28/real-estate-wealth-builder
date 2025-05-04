
// Calculate monthly payment using amortization formula
export const calculateMonthlyPayment = (
  principal: number,
  interestRate: number,
  termYears: number
): number => {
  // Convert annual interest rate to monthly decimal
  const monthlyRate = interestRate / 100 / 12;
  const totalPayments = termYears * 12;

  // Handle edge case of zero interest rate
  if (monthlyRate === 0) return principal / totalPayments;

  const x = Math.pow(1 + monthlyRate, totalPayments);
  return (principal * monthlyRate * x) / (x - 1);
};

// Calculate monthly rent with annual increases
export const calculateMonthlyRentOverTime = (
  initialRent: number,
  annualIncrease: number,
  monthsPassed: number
): number => {
  const yearsPassed = Math.floor(monthsPassed / 12);
  return initialRent * Math.pow(1 + annualIncrease / 100, yearsPassed);
};

// Calculate equity buildup (principal reduction + appreciation)
export const calculateEquity = (
  purchasePrice: number,
  downPayment: number,
  firstMortgageAmount: number,
  firstMortgageRate: number,
  firstMortgageTerm: number,
  sbaAmount: number,
  sbaRate: number,
  sbaTerm: number,
  appreciationRate: number,
  months: number
): number => {
  // Calculate initial equity (down payment)
  let equity = downPayment;

  // Add appreciation
  const appreciatedValue = purchasePrice * Math.pow(1 + appreciationRate / 100, months / 12);
  const appreciation = appreciatedValue - purchasePrice;
  equity += appreciation;

  // Calculate principal reduction for first mortgage
  const firstMortgagePrincipalPaid = calculatePrincipalPaid(
    firstMortgageAmount,
    firstMortgageRate,
    firstMortgageTerm,
    months
  );
  
  // Calculate principal reduction for SBA loan
  const sbaPrincipalPaid = calculatePrincipalPaid(
    sbaAmount,
    sbaRate,
    sbaTerm,
    months
  );
  
  // Add principal reduction to equity
  equity += firstMortgagePrincipalPaid + sbaPrincipalPaid;
  
  return equity;
};

// Calculate principal paid over a period
export const calculatePrincipalPaid = (
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

// Calculate tax benefits from interest and depreciation
export const calculateMonthlyTaxBenefit = (
  purchasePrice: number,
  buildingValue: number, // Typically 80% of purchase price for commercial
  firstMortgageAmount: number,
  firstMortgageRate: number,
  sbaAmount: number,
  sbaRate: number,
  propertyTaxRate: number,
  incomeTaxRate: number,
  month: number
): number => {
  // Calculate interest paid in this month
  const firstMortgageInterest = calculateInterestForMonth(
    firstMortgageAmount,
    firstMortgageRate,
    month
  );
  
  const sbaInterest = calculateInterestForMonth(
    sbaAmount,
    sbaRate,
    month
  );
  
  // Calculate monthly depreciation (39-year straight line for commercial)
  const monthlyDepreciation = (buildingValue / 39) / 12;
  
  // Calculate monthly property tax
  const annualPropertyTax = purchasePrice * (propertyTaxRate / 100);
  const monthlyPropertyTax = annualPropertyTax / 12;
  
  // Calculate total tax deductions
  const totalDeductions = firstMortgageInterest + sbaInterest + monthlyDepreciation + monthlyPropertyTax;
  
  // Calculate tax benefit
  const taxBenefit = totalDeductions * (incomeTaxRate / 100);
  
  return taxBenefit;
};

// Calculate interest payment for a specific month
export const calculateInterestForMonth = (
  principal: number,
  interestRate: number,
  monthNumber: number
): number => {
  // Convert annual interest rate to monthly decimal
  const monthlyRate = interestRate / 100 / 12;
  
  // For simplicity, we'll use an approximation based on the original principal
  // A more accurate calculation would account for the declining balance
  const remainingPrincipal = principal * Math.pow(1 - monthlyRate, monthNumber - 1);
  
  return remainingPrincipal * monthlyRate;
};

// Format currency for display
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format percentage for display
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

// Calculate the crossover point (when buying becomes cheaper than renting)
export const calculateCrossoverPoint = (
  purchasePrice: number,
  downPayment: number,
  firstMortgageAmount: number,
  firstMortgageRate: number,
  firstMortgageTerm: number,
  sbaAmount: number,
  sbaRate: number,
  sbaTerm: number,
  initialRent: number,
  annualRentIncrease: number,
  propertyTaxRate: number,
  insuranceRate: number,
  incomeTaxRate: number,
  appreciationRate: number
): number => {
  // Calculate monthly ownership costs
  const firstMortgagePayment = calculateMonthlyPayment(firstMortgageAmount, firstMortgageRate, firstMortgageTerm);
  const sbaPayment = calculateMonthlyPayment(sbaAmount, sbaRate, sbaTerm);
  const monthlyPropertyTax = (purchasePrice * (propertyTaxRate / 100)) / 12;
  const monthlyInsurance = (purchasePrice * (insuranceRate / 100)) / 12;
  
  // Initialize cumulative costs
  let cumulativeRentCost = 0;
  let cumulativeOwnershipCost = downPayment; // Initial cost is down payment
  
  // Loop through months until crossover
  for (let month = 1; month <= 360; month++) { // Check up to 30 years
    // Calculate rent for this month
    const currentRent = calculateMonthlyRentOverTime(initialRent, annualRentIncrease, month);
    cumulativeRentCost += currentRent;
    
    // Calculate ownership cost for this month (mortgage payments + taxes + insurance - tax benefits - appreciation)
    let monthlyCost = firstMortgagePayment + sbaPayment + monthlyPropertyTax + monthlyInsurance;
    
    // Calculate tax benefit for this month
    const taxBenefit = calculateMonthlyTaxBenefit(
      purchasePrice,
      purchasePrice * 0.8, // Assuming building value is 80% of purchase price
      firstMortgageAmount,
      firstMortgageRate,
      sbaAmount,
      sbaRate,
      propertyTaxRate,
      incomeTaxRate,
      month
    );
    
    // Subtract tax benefit
    monthlyCost -= taxBenefit;
    
    // Add to cumulative ownership cost
    cumulativeOwnershipCost += monthlyCost;
    
    // Calculate equity built this month (property appreciation + principal reduction)
    const monthlyPrincipalPaid = 
      (calculatePrincipalPaid(firstMortgageAmount, firstMortgageRate, firstMortgageTerm, month) +
       calculatePrincipalPaid(sbaAmount, sbaRate, sbaTerm, month)) / month;
    
    const monthlyAppreciation = purchasePrice * (appreciationRate / 100) / 12;
    
    // Subtract equity from ownership cost (it's an asset, not an expense)
    cumulativeOwnershipCost -= (monthlyPrincipalPaid + monthlyAppreciation);
    
    // Check if we've reached the crossover point
    if (cumulativeOwnershipCost < cumulativeRentCost) {
      return month;
    }
  }
  
  // If no crossover found within 30 years
  return -1;
};
