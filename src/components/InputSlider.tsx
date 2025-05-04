
import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputSliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  formatLabel?: (value: number) => string;
  unit?: string;
  className?: string;
  inputWidth?: string;
}

const InputSlider = ({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue = (val) => val.toString(),
  formatLabel = (val) => val.toString(),
  unit = "",
  className = "",
  inputWidth = "w-24",
}: InputSliderProps) => {
  const [localValue, setLocalValue] = useState<string>(formatValue(value));
  const [sliderValue, setSliderValue] = useState<number>(value);

  useEffect(() => {
    setLocalValue(formatValue(value));
    setSliderValue(value);
  }, [value, formatValue]);

  const handleSliderChange = (newValue: number[]) => {
    const value = newValue[0];
    setSliderValue(value);
    setLocalValue(formatValue(value));
    onChange(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setLocalValue(inputValue);
    
    // Remove formatting for validation
    const numericValue = parseFloat(inputValue.replace(/[^0-9.-]+/g, ""));
    
    if (!isNaN(numericValue)) {
      const boundedValue = Math.min(Math.max(numericValue, min), max);
      setSliderValue(boundedValue);
      if (numericValue >= min && numericValue <= max) {
        onChange(boundedValue);
      }
    }
  };

  const handleInputBlur = () => {
    if (isNaN(parseFloat(localValue.replace(/[^0-9.-]+/g, "")))) {
      setLocalValue(formatValue(value));
      return;
    }
    
    const numericValue = parseFloat(localValue.replace(/[^0-9.-]+/g, ""));
    const boundedValue = Math.min(Math.max(numericValue, min), max);
    setLocalValue(formatValue(boundedValue));
    setSliderValue(boundedValue);
    onChange(boundedValue);
  };

  return (
    <div className={`sba-input-group ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
        <div className={`relative ${inputWidth}`}>
          <Input
            type="text"
            value={localValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="pr-6 text-right"
          />
          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              {unit}
            </span>
          )}
        </div>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[sliderValue]}
        onValueChange={handleSliderChange}
        className="sba-slider"
      />
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>{formatLabel(min)}</span>
        <span>{formatLabel(max)}</span>
      </div>
    </div>
  );
};

export default InputSlider;
