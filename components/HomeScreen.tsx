import {
  View, Text, ScrollView,
  TouchableOpacity, StyleSheet,
} from 'react-native';
import { useState } from 'react';
import { useStore } from '../store/contactsStore';
import { getDaysUntil, Contact } from '../types/Contact';
import { C, TAGS } from '../constants/colors';
import { Avatar } from './Avatar';
import { TagBadge } from './TagBadge';
import { HadithCard } from './HadithCard';
import { PostCallModal } from './PostCallModal';

// ── Helpers ──────────────────────────────────────────────────────
const formatDue = (days: number, lang: 'ar' | 'en'): string => {
  if (days <= -30) return lang === 'ar' ? 'متأخر جداً'                  : 'Very overdue';
  if (days < 0)   return lang === 'ar' ? `متأخر ${Math.abs(days)} أيام` : `${Math.abs(days)}d overdue`;
  if (days === 0) return lang === 'ar' ? 'اليوم'                        : 'Due today';
  if (days === 1) return lang === 'ar' ? 'غداً'                         : 'Tomorrow';
  return lang === 'ar' ? `بعد ${days} أيام` : `In ${days}d`;
};

const dueColor = (days: number) =>
  days <= 0 ? C.danger : days <= 2 ? C.gold : C.safe;

// ── Component ─────────────────────────────────────────────────────
export function HomeScreen() {
  const { contacts, streak, todayCalledId, markCalled, lang, setLang } = useStore();
  const [showModal, setShowModal] = useState(false);
  const isAr = lang === 'ar';

  // Sort: priority first, then most overdue first
  const sorted = [...contacts].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority ? -1 : 1;
    return getDaysUntil(a) - getDaysUntil(b);
  });

  const hero          = sorted[0];
  const alreadyCalled = hero && todayCalledId === hero.id;
  const overdue       = contacts.filter(c => getDaysUntil(c) <= 0).length;

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content}>

      {/* ── Header ── */}
      <View style={[s.header, isAr && s.rowReverse]}>
        <View>
          <Text style={s.arabic}>صِلَة الرَّحِم</Text>
          <Text style={s.title}>{isAr ? 'مكالمة اليوم' : "Today's Call"}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setLang(isAr ? 'en' : 'ar')}
          style={s.langBtn}
        >
          <Text style={s.langBtnText}>{isAr ? 'EN' : 'عربي'}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Stats row ── */}
      <View style={[s.statsRow, isAr && s.rowReverse]}>
        <View style={s.statCard}>
          <Text style={s.statVal}>{streak}</Text>
          <Text style={s.statLbl}>{isAr ? 'يوم متتالي' : 'day streak'}</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statVal}>{contacts.length}</Text>
          <Text style={s.statLbl}>{isAr ? 'في دائرتك' : 'in circle'}</Text>
        </View>
        {overdue > 0 && (
          <View style={[s.statCard, { borderColor: C.danger + '40' }]}>
            <Text style={[s.statVal, { color: C.danger }]}>{overdue}</Text>
            <Text style={s.statLbl}>{isAr ? 'متأخرة' : 'overdue'}</Text>
          </View>
        )}
      </View>

      {/* ── Hero Card ── */}
      {hero ? (
        <View style={[s.heroCard, alreadyCalled && s.heroCardCalled]}>

          {/* Top row */}
          <View style={[s.row, s.spaceBetween, { marginBottom: 14 }]}>
            <View>
              <Text style={[s.heroLabel, { color: alreadyCalled ? C.safe : C.gold }]}>
                {alreadyCalled
                  ? (isAr ? '✓ تم الاتصال' : '✓ Called Today')
                  : (isAr ? 'اتصل اليوم'   : 'Call Today')}
              </Text>
              <Text style={s.heroName}>{hero.name}</Text>
            </View>
            <TagBadge tag={hero.tag} lang={lang} />
          </View>

          {/* Due info */}
          <View style={[s.row, { marginBottom: hero.nextCallNote ? 12 : 16 }]}>
            <Text style={[s.dueText, { color: dueColor(getDaysUntil(hero)) }]}>
              {formatDue(getDaysUntil(hero), lang)}
            </Text>
            <Text style={s.dot}>·</Text>
            <Text style={s.intervalText}>
              {isAr ? `كل ${hero.interval} أيام` : `Every ${hero.interval}d`}
            </Text>
            {hero.priority && (
              <Text style={{ color: C.gold, marginLeft: 6 }}>★</Text>
            )}
          </View>

          {/* Next call note */}
          {hero.nextCallNote ? (
            <View style={s.noteBox}>
              <Text style={s.noteText}>📝  {hero.nextCallNote}</Text>
            </View>
          ) : null}

          {/* Last called */}
          <Text style={s.lastCalled}>
            {isAr ? 'آخر مكالمة: ' : 'Last called: '}
            {hero.lastCalled ?? (isAr ? 'لم يُتصل بعد' : 'Never')}
          </Text>

          {/* Action button */}
          {!alreadyCalled ? (
            <TouchableOpacity
              style={s.callBtn}
              onPress={() => setShowModal(true)}
            >
              <Text style={s.callBtnText}>
                {isAr ? '✓ سجّل المكالمة' : '✓ Mark as Called'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={s.greatJob}>
              {isAr
                ? '✓ أحسنت! جعلت يوم شخص أجمل.'
                : "✓ Great job! You made someone's day better."}
            </Text>
          )}
        </View>
      ) : (
        <View style={s.emptyCard}>
          <Text style={{ fontSize: 36, marginBottom: 8 }}>🌿</Text>
          <Text style={{ color: C.creamDim }}>
            {isAr ? 'أضف جهات اتصال للبدء' : 'Add contacts to begin'}
          </Text>
        </View>
      )}

      {/* ── Up Next ── */}
      {sorted.length > 1 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={s.sectionLabel}>
            {isAr ? 'التالي' : 'Up Next'}
          </Text>
          {sorted.slice(1, 4).map(c => (
            <View key={c.id} style={[s.upNextRow, isAr && s.rowReverse]}>
              <Avatar name={c.name} tag={c.tag} size={38} />
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <Text style={s.upNextName}>{c.name}</Text>
                <Text style={[s.upNextDue, { color: dueColor(getDaysUntil(c)) }]}>
                  {formatDue(getDaysUntil(c), lang)}
                </Text>
              </View>
              <TagBadge tag={c.tag} lang={lang} />
            </View>
          ))}
        </View>
      )}

      {/* ── Hadith ── */}
      <HadithCard lang={lang} />

      {/* ── Post-Call Modal ── */}
      <PostCallModal
        contact={hero}
        visible={showModal}
        lang={lang}
        onClose={() => setShowModal(false)}
        onConfirm={(nextNote, newInterval) => {
          markCalled(hero.id, nextNote, newInterval);
          setShowModal(false);
        }}
      />

    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const s = StyleSheet.create({
  scroll:         { flex: 1, backgroundColor: C.bg },
  content:        { padding: 18, paddingTop: 56 },

  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  rowReverse:     { flexDirection: 'row-reverse' },
  arabic:         { fontSize: 13, color: C.gold, letterSpacing: 2, marginBottom: 3 },
  title:          { fontSize: 26, fontWeight: '700', color: C.cream },
  langBtn:        { backgroundColor: C.goldSoft, borderWidth: 1, borderColor: C.goldBorder, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  langBtnText:    { color: C.gold, fontSize: 12, fontWeight: '600' },

  statsRow:       { flexDirection: 'row', gap: 10, marginBottom: 18 },
  statCard:       { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 12, alignItems: 'center' },
  statVal:        { fontSize: 22, fontWeight: '700', color: C.cream },
  statLbl:        { fontSize: 10, color: C.creamMute, marginTop: 2 },

  heroCard:       { backgroundColor: C.card, borderWidth: 1, borderColor: C.goldBorder, borderRadius: 22, padding: 20, marginBottom: 16 },
  heroCardCalled: { borderColor: C.safe + '50', backgroundColor: C.safeBg },
  heroLabel:      { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 5 },
  heroName:       { fontSize: 30, fontWeight: '700', color: C.cream },

  row:            { flexDirection: 'row', alignItems: 'center' },
  spaceBetween:   { justifyContent: 'space-between' },
  dueText:        { fontSize: 13, fontWeight: '600' },
  dot:            { color: C.creamMute, marginHorizontal: 6 },
  intervalText:   { fontSize: 12, color: C.creamMute },

  noteBox:        { backgroundColor: C.goldSoft, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 12, marginBottom: 14 },
  noteText:       { fontSize: 13, color: C.creamDim, lineHeight: 20 },

  lastCalled:     { fontSize: 12, color: C.creamMute, marginBottom: 16 },

  callBtn:        { backgroundColor: C.gold, borderRadius: 14, padding: 14, alignItems: 'center' },
  callBtnText:    { color: '#0c1c14', fontWeight: '700', fontSize: 15 },
  greatJob:       { color: C.safe, textAlign: 'center', fontWeight: '600', fontSize: 14 },

  emptyCard:      { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 22, padding: 40, alignItems: 'center', marginBottom: 16 },

  sectionLabel:   { fontSize: 11, color: C.creamMute, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, fontWeight: '600' },
  upNextRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  upNextName:     { fontSize: 14, color: C.cream, fontWeight: '500' },
  upNextDue:      { fontSize: 12, marginTop: 2 },
});