import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export interface Disease {
  id: string;
  slug: string;
  name: string;
  name_en: string;
  description?: string;
}

interface DiseaseComboboxProps {
  diseases: Disease[];
  selectedDisease: string;
  onDiseaseChange: (diseaseSlug: string) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  shouldAnimate?: boolean;
}

export const DiseaseCombobox: React.FC<DiseaseComboboxProps> = ({
  diseases,
  selectedDisease,
  onDiseaseChange,
  searchTerm,
  onSearchTermChange,
  className,
  placeholder,
  disabled = false,
  shouldAnimate = false
}) => {
  const { t } = useLanguage();
  const defaultPlaceholder = placeholder || t('search.placeholder.disease');
  const [open, setOpen] = useState(false);
  const commandRef = useRef<HTMLDivElement>(null);

  // Find selected disease info
  const selectedDis = diseases.find(dis => dis.slug === selectedDisease);

  // Filter diseases based on search term (local search)
  const filteredDiseases = useMemo(() => {
    if (!searchTerm.trim()) {
      return diseases;
    }

    const term = searchTerm.toLowerCase();
    return diseases.filter(dis => 
      dis.name.toLowerCase().includes(term) ||
      dis.name_en.toLowerCase().includes(term) ||
      (dis.description && dis.description.toLowerCase().includes(term))
    );
  }, [diseases, searchTerm]);

  // Handle disease selection
  const handleSelect = (diseaseSlug: string) => {
    onDiseaseChange(diseaseSlug);
    setOpen(false);
    onSearchTermChange(''); // Clear search term after selection
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    onSearchTermChange(value);
  };

  // Scroll to selected item when dropdown opens
  useEffect(() => {
    if (open && selectedDisease) {
      // Small delay to ensure the dropdown is fully rendered
      setTimeout(() => {
        const selectedElement = document.querySelector(`[data-value="${selectedDisease}"]`);
        if (selectedElement) {
          selectedElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
    }
  }, [open, selectedDisease]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className={cn("relative", className)}>
      <Popover open={open && !disabled} onOpenChange={(value) => !disabled && setOpen(value)}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between h-10 text-sm text-left font-normal bg-white border border-gray-200 rounded-md transition-all duration-300",
              !disabled && "hover:bg-gray-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20",
              disabled && "opacity-50 cursor-not-allowed bg-gray-50",
              shouldAnimate && "animate-pulse border-emerald-500 shadow-lg shadow-emerald-500/30"
            )}
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <span className={cn(
                "truncate",
                selectedDis ? "text-gray-900" : "text-gray-500"
              )}>
                {selectedDis ? selectedDis.name : defaultPlaceholder}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-gray-400" />
          </Button>
        </PopoverTrigger>
        
        {!disabled && (
          <PopoverContent 
            className="w-[400px] p-0 border-gray-200 shadow-lg" 
            align="start"
            ref={commandRef}
          >
            <Command className="rounded-lg border-none">
              <CommandInput
                placeholder={t('common.search')}
                value={searchTerm}
                onValueChange={handleSearchChange}
                className="h-12 border-none focus:ring-0 text-base"
              />
              
              <CommandList className="max-h-[500px] overflow-y-auto">
                <CommandEmpty className="py-6 text-center text-gray-500">
                  {t('common.noResults')}
                </CommandEmpty>

                <CommandGroup>
                  {filteredDiseases.map((dis) => (
                    <CommandItem
                      key={dis.slug}
                      value={dis.slug}
                      data-value={dis.slug}
                      onSelect={() => handleSelect(dis.slug)}
                      className={cn(
                        "flex items-center justify-between py-2.5 px-3 hover:bg-emerald-50 cursor-pointer rounded-md mx-1",
                        selectedDisease === dis.slug && "bg-emerald-100/70"
                      )}
                    >
                      <div className="flex-1">
                        <div className="font-sans font-semibold text-base text-gray-900">{dis.name}</div>
                        {dis.description && (
                          <div className="font-sans text-[10px] text-gray-500 mt-0.5 truncate">
                            {dis.description}
                          </div>
                        )}
                      </div>
                      {selectedDisease === dis.slug && (
                        <Check className="h-4 w-4 text-emerald-600 ml-2 flex-shrink-0" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
};

export default DiseaseCombobox;