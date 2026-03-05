import { View, Text } from 'react-native';
import { C } from '../constants/colors';

interface Props {
  lang: 'ar' | 'en';
}

export function HadithCard({ lang }: Props) {
  const { HADITHS } = require('../constants/hadiths');
  const list = HADITHS[lang];
  const hadith = list[Math.floor(Date.now() / 86400000) % list.length];

  return (
    <View style={{
      backgroundColor: C.card,
      borderWidth: 1, borderColor: C.border,
      borderRadius: 18, padding: 18, marginBottom: 8,
    }}>
      <Text style={{ fontSize: 13, color: C.gold, marginBottom: 8 }}>"</Text>
      <Text style={{
        fontSize: lang === 'ar' ? 14 : 15,
        color: C.creamDim,
        lineHeight: lang === 'ar' ? 26 : 24,
        textAlign: lang === 'ar' ? 'right' : 'left',
        marginBottom: 10,
      }}>
        {hadith.text}
      </Text>
      <Text style={{ fontSize: 11, color: C.gold }}>
        — {hadith.source}
      </Text>
    </View>
  );
}