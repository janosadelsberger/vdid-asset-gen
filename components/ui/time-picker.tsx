import * as React from "react";
import { Input } from "@/components/ui/input";

type TimePickerProps = {
  value: string;
  onChange: (value: string) => void;
};

export function TimePicker({ value, onChange }: TimePickerProps) {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange(e.target.value);
  };

  return (
    <Input
      type="time"
      value={value}
      onChange={handleChange}
      step={300}
      placeholder="Uhrzeit wählen"
    />
  );
}

