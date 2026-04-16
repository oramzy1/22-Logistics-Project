import React from 'react';
import { View } from 'react-native';
import { FormInput } from './FormInput';
import { DropdownInput } from './DropdownInput';
import { RIVERS_LGAS } from '../utils/nigeriaLocations';

interface LocationInputProps {
  label: string;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  street: string;
  lga: string;
  onStreetChange: (val: string) => void;
  onLGASelect: (lga: string) => void;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  label, placeholder = 'Enter street / area name',
  leftIcon, street, lga, onStreetChange, onLGASelect,
}) => (
  <View>
    <FormInput
      label={label}
      placeholder={placeholder}
      value={street}
      onChangeText={onStreetChange}
      leftIcon={leftIcon}
    />
    {/* Sits visually below the address input — no label so it reads as part of the same field */}
    <DropdownInput
      placeholder="Select LGA (Rivers State)"
      options={RIVERS_LGAS}
      value={lga}
      onSelect={onLGASelect}
    />
  </View>
);