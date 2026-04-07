import React from 'react';
import { Switch } from 'react-native';

import { colors } from './theme';

export function AppSwitch(props: { value: boolean; onValueChange: (v: boolean) => void }) {
  return <Switch value={props.value} onValueChange={props.onValueChange} trackColor={{ true: colors.goldSoft }} />;
}
