import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type TabBarIconProps = {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
};

export function TabBarIcon({ name, color }: TabBarIconProps) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} name={name} color={color} />;
}
