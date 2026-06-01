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
import { Department } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';

// Popular specialties configuration
const POPULAR_SPECIALTIES = ['cardiology', 'oncology', 'orthopedics', 'neurology'];

interface DepartmentComboboxProps {
  departments: Department[];
  selectedDepartment: string;
  onDepartmentChange: (departmentSlug: string) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  className?: string;
  placeholder?: string;
}

export const DepartmentCombobox: React.FC<DepartmentComboboxProps> = ({
  departments,
  selectedDepartment,
  onDepartmentChange,
  searchTerm,
  onSearchTermChange,
  className,
  placeholder
}) => {
  const { t } = useLanguage();
  const defaultPlaceholder = placeholder || t('departments.placeholder');
  const [open, setOpen] = useState(false);
  const commandRef = useRef<HTMLDivElement>(null);

  // Find selected department info
  const selectedDept = departments.find(dept => dept.slug === selectedDepartment);

  // Filter departments based on search term (local search)
  const filteredDepartments = useMemo(() => {
    if (!searchTerm.trim()) {
      return departments;
    }

    const term = searchTerm.toLowerCase();
    return departments.filter(dept => 
      dept.name.toLowerCase().includes(term) ||
      dept.name_en.toLowerCase().includes(term) ||
      (dept.short_desc && dept.short_desc.toLowerCase().includes(term))
    );
  }, [departments, searchTerm]);

  // Group departments into popular and others
  const groupedDepartments = useMemo(() => {
    const popular: Department[] = [];
    const others: Department[] = [];

    filteredDepartments.forEach(dept => {
      if (POPULAR_SPECIALTIES.includes(dept.slug)) {
        popular.push(dept);
      } else {
        others.push(dept);
      }
    });

    // Sort others alphabetically by Chinese name
    others.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));

    return { popular, others };
  }, [filteredDepartments]);

  // Handle department selection
  const handleSelect = (departmentSlug: string) => {
    onDepartmentChange(departmentSlug);
    setOpen(false);
    onSearchTermChange(''); // Clear search term after selection
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    onSearchTermChange(value);
  };

  // Scroll to selected item when dropdown opens
  useEffect(() => {
    if (open && selectedDepartment) {
      // Small delay to ensure the dropdown is fully rendered
      setTimeout(() => {
        const selectedElement = document.querySelector(`[data-value="${selectedDepartment}"]`);
        if (selectedElement) {
          selectedElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
    }
  }, [open, selectedDepartment]);

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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-10 text-sm text-left font-normal bg-white border border-gray-200 hover:bg-gray-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-md"
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <span className={cn(
                "truncate",
                selectedDept ? "text-gray-900" : "text-gray-500"
              )}>
                {selectedDept ? selectedDept.name : defaultPlaceholder}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-gray-400" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-[90vw] max-w-md md:w-[400px] p-0 border-gray-200 shadow-lg" 
          align="start"
          ref={commandRef}
        >
          <Command className="rounded-lg border-none">
            <CommandInput
              placeholder={t('departments.search')}
              value={searchTerm}
              onValueChange={handleSearchChange}
              className="h-12 border-none focus:ring-0 text-base"
            />
            
            <CommandList className="max-h-[500px] overflow-y-auto">
              <CommandEmpty className="py-6 text-center text-gray-500">
                {t('common.noResults')}
              </CommandEmpty>

              {/* Popular Specialties Group */}
              {groupedDepartments.popular.length > 0 && (
                <CommandGroup heading={t('departments.popular')} className="border-b border-gray-100 pb-2 mb-2">
                  {groupedDepartments.popular.map((dept) => (
                    <CommandItem
                      key={dept.slug}
                      value={dept.slug}
                      data-value={dept.slug}
                      onSelect={() => handleSelect(dept.slug)}
                      className={cn(
                        "flex items-center justify-between py-2.5 px-3 hover:bg-emerald-50 cursor-pointer rounded-md mx-1",
                        selectedDepartment === dept.slug && "bg-emerald-100/70"
                      )}
                    >
                      <div className="flex-1">
                        <div className="font-sans font-semibold text-base text-gray-900">{dept.name}</div>
                        {dept.short_desc && (
                          <div className="font-sans text-[10px] text-gray-500 mt-0.5 truncate">
                            {dept.short_desc}
                          </div>
                        )}
                      </div>
                      {selectedDepartment === dept.slug && (
                        <Check className="h-4 w-4 text-emerald-600 ml-2 flex-shrink-0" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* More Specialties Group (A-Z) */}
              {groupedDepartments.others.length > 0 && (
                <CommandGroup heading={t('departments.more')} className="pt-2">
                  {groupedDepartments.others.map((dept) => (
                    <CommandItem
                      key={dept.slug}
                      value={dept.slug}
                      data-value={dept.slug}
                      onSelect={() => handleSelect(dept.slug)}
                      className={cn(
                        "flex items-center justify-between py-2.5 px-3 hover:bg-emerald-50 cursor-pointer rounded-md mx-1",
                        selectedDepartment === dept.slug && "bg-emerald-100/70"
                      )}
                    >
                      <div className="flex-1">
                        <div className="font-sans font-semibold text-base text-gray-900">{dept.name}</div>
                        {dept.short_desc && (
                          <div className="font-sans text-[10px] text-gray-500 mt-0.5 truncate">
                            {dept.short_desc}
                          </div>
                        )}
                      </div>
                      {selectedDepartment === dept.slug && (
                        <Check className="h-4 w-4 text-emerald-600 ml-2 flex-shrink-0" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DepartmentCombobox;
