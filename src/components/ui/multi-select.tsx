import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: readonly Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Seleccione opciones",
  className,
  onOpenChange,
  open: isOpen,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = React.useState("");

  const handleUnselect = (option: string) => {
    onChange(selected.filter((s) => s !== option));
  };

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input) {
        if (e.key === "Delete" || e.key === "Backspace") {
          if (input.value === "" && selected.length > 0) {
            onChange(selected.slice(0, -1));
          }
        }
        if (e.key === "Escape") {
          input.blur();
        }
      }
    },
    [selected, onChange]
  );

  const selectables = options.filter((option) => !selected.includes(option.value));

  return (
    <Command
      onKeyDown={handleKeyDown}
      className={`overflow-visible bg-transparent ${className}`}
    >
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            <div className="flex flex-wrap gap-1">
              {selected.map((selectedValue) => {
                const option = options.find((o) => o.value === selectedValue);
                if (!option) return null;
                return (
                  <Badge
                    key={selectedValue}
                    variant="secondary"
                    className="hover:bg-secondary/80"
                  >
                    {option.label}
                    <button
                      className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
                        if (e.key === "Enter") {
                          handleUnselect(selectedValue);
                        }
                      }}
                      onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={() => handleUnselect(selectedValue)}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                );
              })}
              <CommandPrimitive.Input
                ref={inputRef}
                value={inputValue}
                onValueChange={setInputValue}
                onBlur={() => onOpenChange?.(false)}
                onFocus={() => onOpenChange?.(true)}
                placeholder={selected.length === 0 ? placeholder : undefined}
                className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
              />

            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 w-[var(--radix-popover-trigger-width)]"
          align="start"
          sideOffset={8}
          collisionPadding={16}
        >
          <CommandGroup className="h-full overflow-auto max-h-[200px] bg-white relative z-10">
            {selectables.map((option) => {
              return (
                <CommandItem
                  key={option.value}
                  onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onSelect={() => {
                    setInputValue("");
                    onChange([...selected, option.value]);
                  }}
                  className={"cursor-pointer"}
                >
                  {option.label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </PopoverContent>
      </Popover>
    </Command>
  );
} 