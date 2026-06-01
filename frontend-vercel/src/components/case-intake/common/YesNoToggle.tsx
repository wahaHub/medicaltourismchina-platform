import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLanguage } from '@/contexts/LanguageContext';

interface YesNoToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
  yesLabelKey?: string;
  noLabelKey?: string;
  name?: string; // Optional unique name for the toggle group
}

/**
 * Common Yes/No toggle component for case intake forms
 * Fixes the issue where users cannot switch back from "yes" to "no"
 */
export function YesNoToggle({ 
  value, 
  onChange, 
  yesLabel, 
  noLabel,
  yesLabelKey,
  noLabelKey,
  name
}: YesNoToggleProps) {
  const { t } = useLanguage();

  // Generate stable IDs based on name or use random ID that persists
  const [uniqueId] = React.useState(() => name || `toggle_${Math.random().toString(36).substr(2, 9)}`);
  const noId = `${uniqueId}_no`;
  const yesId = `${uniqueId}_yes`;

  // Use translation keys if provided, otherwise use direct labels
  const finalYesLabel = yesLabelKey ? t(yesLabelKey) : yesLabel || 'Yes';
  const finalNoLabel = noLabelKey ? t(noLabelKey) : noLabel || 'No';

  return (
    <RadioGroup
      value={value ? 'yes' : 'no'}
      onValueChange={(val) => onChange(val === 'yes')}
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="no" id={noId} />
        <Label htmlFor={noId} className="cursor-pointer font-normal">
          {finalNoLabel}
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="yes" id={yesId} />
        <Label htmlFor={yesId} className="cursor-pointer font-normal">
          {finalYesLabel}
        </Label>
      </div>
    </RadioGroup>
  );
}

export default YesNoToggle;

