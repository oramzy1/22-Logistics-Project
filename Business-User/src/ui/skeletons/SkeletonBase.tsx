import { Skeleton } from 'moti/skeleton';
import { useColorScheme, View } from 'react-native';

type Props = {
  width: number | string;
  height: number;
  radius?: number;
};

export function SkeletonBox({ width, height, radius = 8 }: Props) {
  const scheme = useColorScheme();
  return (
    <Skeleton
      // colorMode={scheme === 'dark' ? 'dark' : 'light'}
      colorMode={'#333'}
      width={width as number}
      height={height}
      radius={radius}
    />
  );
}

export function SkeletonSpacer({ height = 12 }: { height?: number }) {
  return <View style={{ height }} />;
}