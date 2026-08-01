import { StyleSheet, Text } from 'react-native';

import { colors, typography } from '@/constants/theme';

type SectionHeadingProps = {
  children: string;
};

export function SectionHeading({ children }: SectionHeadingProps) {
  return <Text style={styles.heading}>{children}</Text>;
}

const styles = StyleSheet.create({
  heading: {
    ...typography.section,
    color: colors.text,
  },
});
