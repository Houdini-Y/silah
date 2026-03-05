import { View, Text } from 'react-native';
import { TAGS } from '../constants/colors';

interface Props {
  tag: keyof typeof TAGS;
  lang: 'ar' | 'en';
}

export function TagBadge({ tag, lang }: Props) {
  const t = TAGS[tag];
  return (
    <View style={{
      backgroundColor: t.bg, borderRadius: 20,
      paddingHorizontal: 10, paddingVertical: 3,
    }}>
      <Text style={{ fontSize: 11, fontWeight: '600', color: t.color }}>
        {lang === 'ar' ? t.labelAr : t.label}
      </Text>
    </View>
  );
}