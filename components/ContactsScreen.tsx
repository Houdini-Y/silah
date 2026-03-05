import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useStore } from '../store/contactsStore';
import { getDaysUntil, Contact } from '../types/Contact';
import { C, TAGS } from '../constants/colors';
import { Avatar } from './Avatar';
import { TagBadge } from './TagBadge';

const formatDue = (days: number, lang: 'ar' | 'en') => {
  if (days <= -30) return lang === 'ar' ? 'متأخر جداً'            : 'Very overdue';
  if (days < 0)   return lang === 'ar' ? `متأخر ${Math.abs(days)} أيام` : `${Math.abs(days)}d overdue`;
  if (days === 0) return lang === 'ar' ? 'اليوم'                  : 'Due today';
  if (days === 1) return lang === 'ar' ? 'غداً'                   : 'Tomorrow';
  return lang === 'ar' ? `بعد ${days} أيام` : `In ${days}d`;
};

const dueColor = (days: number) =>
  days <= 0 ? C.danger : days <= 2 ? C.gold : C.safe;

interface Props {
  onView: (contact: Contact) => void;
  lang: 'ar' | 'en';
}

export function ContactsScreen({ onView, lang }: Props) {
  const { contacts } = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | keyof typeof TAGS>('all');
  const isAr = lang === 'ar';

  const filtered = [...contacts]
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    .filter(c => filter === 'all' || c.tag === filter)
    .sort((a, b) => getDaysUntil(a) - getDaysUntil(b));

  const overdue = contacts.filter(c => getDaysUntil(c) <= 0).length;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={s.content}>

        {/* Header */}
        <View style={{ marginBottom: 18 }}>
          <Text style={s.title}>{isAr ? 'دائرتك' : 'Your Circle'}</Text>
          {overdue > 0 && (
            <Text style={{ fontSize: 13, color: C.danger, marginTop: 3 }}>
              {isAr ? `${overdue} جهة تحتاج اهتمامك` : `${overdue} contact${overdue > 1 ? 's' : ''} need attention`}
            </Text>
          )}
        </View>

        {/* Search */}
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={isAr ? 'ابحث...' : 'Search contacts...'}
          placeholderTextColor={C.creamMute}
          style={[s.searchInput, { textAlign: isAr ? 'right' : 'left' }]}
        />

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['all', 'family', 'friend', 'colleague', 'other'] as const).map(f => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                style={[s.chip, filter === f && s.chipActive]}
              >
                <Text style={[s.chipText, filter === f && s.chipTextActive]}>
                  {f === 'all'
                    ? (isAr ? 'الكل' : 'All')
                    : (isAr ? TAGS[f].labelAr : TAGS[f].label)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* List */}
        {filtered.length === 0 ? (
          <Text style={{ color: C.creamMute, textAlign: 'center', marginTop: 40 }}>
            {isAr ? 'لا يوجد جهات اتصال' : 'No contacts found'}
          </Text>
        ) : (
          filtered.map(c => {
            const days = getDaysUntil(c);
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => onView(c)}
                style={s.contactRow}
              >
                <Avatar name={c.name} tag={c.tag} size={44} />
                <View style={{ flex: 1, marginHorizontal: 12 }}>
                  <View style={{ flexDirection: isAr ? 'row-reverse' : 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <Text style={s.contactName}>{c.name}</Text>
                    {c.priority && <Text style={{ color: C.gold, fontSize: 12 }}>★</Text>}
                  </View>
                  <View style={{ flexDirection: isAr ? 'row-reverse' : 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[s.contactDue, { color: dueColor(days) }]}>
                      {formatDue(days, lang)}
                    </Text>
                    <Text style={{ color: C.creamMute, fontSize: 11 }}>·</Text>
                    <Text style={{ fontSize: 11, color: C.creamMute }}>
                      {isAr ? `كل ${c.interval} أيام` : `Every ${c.interval}d`}
                    </Text>
                  </View>
                </View>
                <TagBadge tag={c.tag} lang={lang} />
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  content:         { padding: 18, paddingTop: 56 },
  title:           { fontSize: 26, fontWeight: '700', color: C.cream },
  searchInput:     { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 12, color: C.cream, fontSize: 14, marginBottom: 12 },
  chip:            { borderWidth: 1, borderColor: C.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  chipActive:      { backgroundColor: C.goldSoft, borderColor: C.goldBorder },
  chipText:        { fontSize: 12, color: C.creamMute },
  chipTextActive:  { color: C.gold, fontWeight: '600' },
  contactRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14, marginBottom: 10 },
  contactName:     { fontSize: 15, color: C.cream, fontWeight: '500' },
  contactDue:      { fontSize: 12, fontWeight: '600' },
});