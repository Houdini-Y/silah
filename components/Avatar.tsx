import { View, Text } from 'react-native';
import { TAGS } from '../constants/colors';

interface Props {
  name: string;
  tag: keyof typeof TAGS;
  size?: number;
}

export function Avatar({ name, tag, size = 46 }: Props) {
  const t = TAGS[tag];
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: t.bg,
      borderWidth: 2, borderColor: t.color + '40',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ fontSize: size * 0.42, fontWeight: '700', color: t.color }}>
        {[...name][0]?.toUpperCase()}
      </Text>
    </View>
  );
}