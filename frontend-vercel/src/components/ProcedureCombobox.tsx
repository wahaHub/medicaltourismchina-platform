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
import { SimpleProcedure } from '@/services/api';

interface ProcedureComboboxProps {
  procedures: SimpleProcedure[];
  selectedProcedure: string;
  onProcedureChange: (procedureSlug: string) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const ProcedureCombobox: React.FC<ProcedureComboboxProps> = ({
  procedures,
  selectedProcedure,
  onProcedureChange,
  searchTerm,
  onSearchTermChange,
  className,
  placeholder,
  disabled = false
}) => {
  const { t, currentLanguage } = useLanguage();
  const defaultPlaceholder = placeholder || t('search.placeholder.procedure');
  const [open, setOpen] = useState(false);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Filter procedures based on search term
  const filteredProcedures = useMemo(() => {
    if (!localSearchTerm) return procedures;
    
    const searchLower = localSearchTerm.toLowerCase();
    return procedures.filter(procedure => {
      const nameToSearch = currentLanguage === 'zh-CN' ? procedure.name : (procedure.name_en || procedure.name);
      return nameToSearch.toLowerCase().includes(searchLower) ||
             procedure.slug.toLowerCase().includes(searchLower) ||
             (procedure.description && procedure.description.toLowerCase().includes(searchLower));
    });
  }, [procedures, localSearchTerm, currentLanguage]);

  // Group procedures by first letter for better organization
  const groupedProcedures = useMemo(() => {
    const groups: Record<string, SimpleProcedure[]> = {};
    
    filteredProcedures.forEach(procedure => {
      const nameToUse = currentLanguage === 'zh-CN' ? procedure.name : (procedure.name_en || procedure.name);
      const firstChar = nameToUse[0]?.toUpperCase() || '#';
      if (!groups[firstChar]) {
        groups[firstChar] = [];
      }
      groups[firstChar].push(procedure);
    });
    
    return groups;
  }, [filteredProcedures, currentLanguage]);

  // Focus on command input when popover opens
  useEffect(() => {
    if (open && commandInputRef.current) {
      setTimeout(() => {
        commandInputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  // Update local search term when prop changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
    onSearchTermChange(value);
  };

  // Handle procedure selection
  const handleSelect = (procedureSlug: string) => {
    onProcedureChange(procedureSlug);
    setOpen(false);
    setLocalSearchTerm('');
    onSearchTermChange('');
  };

  // Get selected procedure info
  const selectedProc = procedures.find(proc => proc.slug === selectedProcedure);
  const displayName = selectedProc 
    ? (currentLanguage === 'zh-CN' ? selectedProc.name : (selectedProc.name_en || selectedProc.name))
    : '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={defaultPlaceholder}
          className={cn(
            "w-full justify-between text-left font-normal",
            !selectedProcedure && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Search className="h-4 w-4 shrink-0 opacity-50" />
            <span className="truncate">
              {selectedProcedure ? displayName : defaultPlaceholder}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput 
            ref={commandInputRef}
            placeholder={t('search.searchPlaceholder')} 
            value={localSearchTerm}
            onValueChange={handleSearchChange}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>{t('search.noProceduresFound')}</CommandEmpty>
            {Object.keys(groupedProcedures).sort().map((group) => (
              <CommandGroup key={group} heading={group}>
                {groupedProcedures[group].map((procedure) => {
                  const nameToDisplay = currentLanguage === 'zh-CN' ? procedure.name : (procedure.name_en || procedure.name);
                  const showEnglish = currentLanguage === 'zh-CN' && procedure.name_en;
                  
                  return (
                    <CommandItem
                      key={procedure.slug}
                      value={procedure.slug}
                      onSelect={() => handleSelect(procedure.slug)}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{nameToDisplay}</span>
                          {showEnglish && (
                            <span className="text-xs text-muted-foreground truncate">
                              {procedure.name_en}
                            </span>
                          )}
                        </div>
                        {procedure.cost_usd && (
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{procedure.cost_usd}</span>
                            {procedure.waiting_time && (
                              <>
                                <span>•</span>
                                <span>{t('search.waitTime')}: {procedure.waiting_time}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <Check
                        className={cn(
                          "ml-2 h-4 w-4 shrink-0",
                          selectedProcedure === procedure.slug ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ProcedureCombobox;