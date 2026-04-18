import { Skeleton } from 'moti/skeleton';
import { useColorScheme, View } from 'react-native';
import { useAppTheme } from '../useAppTheme';

type Props = {
  width: number | string;
  height: number;
  radius?: number;
};

export function SkeletonBox({ width, height, radius = 8 }: Props) {
  const { isDark, colors: themeColors } = useAppTheme();
  const scheme = useColorScheme();
  return (
    <Skeleton
      colorMode={scheme === 'dark' ? 'dark' : 'light'}
      // colorMode={themeColors.background}
      width={width as number}
      height={height}
      radius={radius}
    />
  );
}

export function SkeletonSpacer({ height = 12 }: { height?: number }) {
  return <View style={{ height }} />;
}