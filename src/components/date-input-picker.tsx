
"use client"

import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateInputPickerProps {
  value?: Date;
  onChange?: (date?: Date) => void;
  placeholder?: string;
  className?: string;
}

export function DateInputPicker({ value: propValue, onChange, placeholder, className }: DateInputPickerProps) {
  const [inputValue, setInputValue] = React.useState<string>("");
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  React.useEffect(() => {
    if (propValue && isValid(propValue)) {
      setInputValue(format(propValue, "dd/MM/yyyy", { locale: ptBR }));
    } else {
      setInputValue("");
    }
  }, [propValue]);
  
  const handleDateSelect = (selectedDate?: Date) => {
    if (onChange) {
      onChange(selectedDate);
    }
    if(selectedDate && isValid(selectedDate)) {
        setInputValue(format(selectedDate, "dd/MM/yyyy", { locale: ptBR }));
    } else {
        setInputValue("");
    }
    setIsPopoverOpen(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setInputValue(rawValue);

    if (rawValue.length === 10) {
      try {
        const parsedDate = parse(rawValue, "dd/MM/yyyy", new Date());
        if (isValid(parsedDate)) {
          if (onChange) {
            onChange(parsedDate);
          }
        } else {
          if (onChange) {
            onChange(undefined);
          }
        }
      } catch (error) {
        if (onChange) {
          onChange(undefined);
        }
      }
    } else if (rawValue === "") {
        if (onChange) {
            onChange(undefined);
        }
    }
  };

  const handleInputBlur = () => {
    // on blur, format the input value from the source of truth (propValue)
    if (propValue && isValid(propValue)) {
      setInputValue(format(propValue, "dd/MM/yyyy", { locale: ptBR }));
    } else {
      // if input is not a valid date, clear it
      try {
        const parsedDate = parse(inputValue, "dd/MM/yyyy", new Date());
        if (!isValid(parsedDate)) {
            setInputValue("");
            if(onChange) onChange(undefined);
        }
      } catch(e) {
          setInputValue("");
          if(onChange) onChange(undefined);
      }
    }
  };

  return (
    <div className={cn("relative flex items-center", className)}>
        <Input
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder={placeholder || "dd/mm/aaaa"}
            className="pr-10"
        />
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"ghost"}
                    size="icon"
                    className="absolute right-1 h-8 w-8 text-muted-foreground hover:text-foreground"
                    aria-label="Abrir calendário"
                >
                    <CalendarIcon className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={propValue}
                    onSelect={handleDateSelect}
                    initialFocus
                    locale={ptBR}
                />
            </PopoverContent>
        </Popover>
    </div>
  )
}
