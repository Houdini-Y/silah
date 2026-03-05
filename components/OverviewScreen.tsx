import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useStore } from '../store/contactsStore';
import { getDaysUntil } from '../types/Contact';
import { C, TAGS } from '../constants/colors';

// ── Helpers ──────────────────────────────────────────────────────
const formatDate = (iso: string, lang: 'ar' | 'en') =>
  new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

// ── Component ─────────────────────────────────────────────────────
export function OverviewScreen() {
  const { contacts, streak, lang } = useStore();
  const isAr = lang === 'ar';

  // ── Stats ─────────────────────────────────────────────────────
  const total    = contacts.length;
  const overdue  = contacts.filter(c => getDaysUntil(c) <= 0).length;
  const dueToday = contacts.filter(c => getDaysUntil(c) === 0).length;
  const healthy  = contacts.filter(c => getDaysUntil(c) > 2).length;
  const neverCalled = contacts.filter(c => !c.lastCalled).length;

  // Total calls logged across all contacts
  const totalCalls = contacts.reduce((sum, c) => sum + c.callHistory.length, 0);

  // Most called contact
  const mostCalled = [...contacts].sort(
    (a, b) => b.callHistory.length - a.callHistory.length
  )[0];

  // Breakdown by tag
  const byTag = (Object.keys(TAGS) as (keyof typeof TAGS)[]).map(tag => ({
    tag,
    count: contacts.filter(c => c.tag === tag).length,
  })).filter(x => x.count > 0);

  // Recently called (last 5)
  const recentlyCalled = [...contacts]
    .filter(c => c.lastCalled)
    .sort((a, b) => (b.lastCalled! > a.lastCalled! ? 1 : -1))
    .slice(0, 5);

  // Circle health score (0–100)
  const healthScore = total === 0
    ? 0
    : Math.round((healthy / total) * 100);

  const healthColor =
    healthScore >= 70 ? C.safe :
    healthScore >= 40 ? C.gold : C.danger;

  const healthLabel =
    healthScore >= 70
      ? (isAr ? 'ممتاز 🌿' : 'Excellent 🌿')
      : healthScore >= 40
      ? (isAr ? 'جيد ⚡'    : 'Good ⚡')
      : (isAr ? 'يحتاج اهتمام ❤️' : 'Needs attention ❤️');

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content}>

      {/* ── Header ── */}
      <Text style={s.title}>
        {isAr ? 'نظرة عامة' : 'Overview'}
      </Text>

      {/* ── Circle Health ── */}
      <View style={s.healthCard}>
        <Text style={s.healthLabel}>
          {isAr ? 'صحة دائرتك' : 'Circle Health'}
        </Text>
        <View style={s.healthRow}>
          <Text style={[s.healthScore, { color: healthColor }]}>
            {healthScore}%
          </Text>
          <Text style={[s.healthTag, { color: healthColor }]}>
            {healthLabel}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={s.barBg}>
          <View style={[s.barFill, {
            width: `${healthScore}%` as any,
            backgroundColor: healthColor,
          }]} />
        </View>

        <Text style={s.healthSub}>
          {isAr
            ? `${healthy} من ${total} جهة اتصال في الوقت المناسب`
            : `${healthy} of ${total} contacts are on track`}
        </Text>
      </View>

      {/* ── Stats grid ── */}
      <View style={s.grid}>
        <View style={s.statCard}>
          <Text style={s.statVal}>{streak}</Text>
          <Text style={s.statLbl}>{isAr ? 'يوم متتالي' : 'Day Streak'}</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statVal}>{totalCalls}</Text>
          <Text style={s.statLbl}>{isAr ? 'مكالمة مسجّلة' : 'Calls Logged'}</Text>
        </View>
        <View style={[s.statCard, overdue > 0 && { borderColor: C.danger + '40' }]}>
          <Text style={[s.statVal, overdue > 0 && { color: C.danger }]}>
            {overdue}
          </Text>
          <Text style={s.statLbl}>{isAr ? 'متأخرة' : 'Overdue'}</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statVal}>{total}</Text>
          <Text style={s.statLbl}>{isAr ? 'في دائرتك' : 'In Circle'}</Text>
        </View>
        {neverCalled > 0 && (
          <View style={[s.statCard, { borderColor: C.gold + '40' }]}>
            <Text style={[s.statVal, { color: C.gold }]}>{neverCalled}</Text>
            <Text style={s.statLbl}>{isAr ? 'لم يُتصل بهم' : 'Never Called'}</Text>
          </View>
        )}
        {dueToday > 0 && (
          <View style={[s.statCard, { borderColor: C.gold + '40' }]}>
            <Text style={[s.statVal, { color: C.gold }]}>{dueToday}</Text>
            <Text style={s.statLbl}>{isAr ? 'اليوم' : 'Due Today'}</Text>
          </View>
        )}
      </View>

      {/* ── By relationship ── */}
      {byTag.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionLabel}>
            {isAr ? 'حسب العلاقة' : 'By Relationship'}
          </Text>
          {byTag.map(({ tag, count }) => {
            const t = TAGS[tag];
            const pct = Math.round((count / total) * 100);
            return (
              <View key={tag} style={s.tagRow}>
                <View style={[s.tagDot, { backgroundColor: t.color }]} />
                <Text style={s.tagName}>
                  {isAr ? t.labelAr : t.label}
                </Text>
                <View style={s.tagBarBg}>
                  <View style={[s.tagBarFill, {
                    width: `${pct}%` as any,
                    backgroundColor: t.color + '80',
                  }]} />
                </View>
                <Text style={s.tagCount}>{count}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* ── Most called ── */}
      {mostCalled && mostCalled.callHistory.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionLabel}>
            {isAr ? 'الأكثر تواصلاً' : 'Most Contacted'}
          </Text>
          <View style={[s.highlightCard, isAr && { flexDirection: 'row-reverse' }]}>
            <View style={[s.bigAvatar, { backgroundColor: TAGS[mostCalled.tag].bg }]}>
              <Text style={[s.bigAvatarText, { color: TAGS[mostCalled.tag].color }]}>
                {[...mostCalled.name][0]?.toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.highlightName}>{mostCalled.name}</Text>
              <Text style={s.highlightSub}>
                {isAr
                  ? `${mostCalled.callHistory.length} مكالمة مسجّلة`
                  : `${mostCalled.callHistory.length} calls logged`}
              </Text>
            </View>
            <Text style={{ fontSize: 28 }}>🏆</Text>
          </View>
        </View>
      )}

      {/* ── Recently called ── */}
      {recentlyCalled.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionLabel}>
            {isAr ? 'آخر المكالمات' : 'Recently Called'}
          </Text>
          {recentlyCalled.map(c => (
            <View
              key={c.id}
              style={[s.recentRow, isAr && { flexDirection: 'row-reverse' }]}
            >
              <View style={[s.miniAvatar, { backgroundColor: TAGS[c.tag].bg }]}>
                <Text style={[s.miniAvatarText, { color: TAGS[c.tag].color }]}>
                  {[...c.name][0]?.toUpperCase()}
                </Text>
              </View>
              <Text style={s.recentName}>{c.name}</Text>
              <Text style={s.recentDate}>
                {c.lastCalled ? formatDate(c.lastCalled, lang) : ''}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* ── Empty state ── */}
      {total === 0 && (
        <View style={s.emptyCard}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🌿</Text>
          <Text style={s.emptyText}>
            {isAr
              ? 'أضف جهات اتصال لرؤية إحصائياتك'
              : 'Add contacts to see your stats'}
          </Text>
        </View>
      )}

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const s = StyleSheet.create({
  scroll:          { flex: 1, backgroundColor: C.bg },
  content:         { padding: 18, paddingTop: 56 },
  title:           { fontSize: 26, fontWeight: '700', color: C.cream, marginBottom: 20 },

  healthCard:      { backgroundColor: C.card, borderWidth: 1, borderColor: C.goldBorder, borderRadius: 20, padding: 20, marginBottom: 16 },
  healthLabel:     { fontSize: 11, color: C.gold, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '700', marginBottom: 10 },
  healthRow:       { flexDirection: 'row', alignItems: 'baseline', gap: 12, marginBottom: 14 },
  healthScore:     { fontSize: 52, fontWeight: '700', lineHeight: 56 },
  healthTag:       { fontSize: 16, fontWeight: '600' },
  barBg:           { height: 6, backgroundColor: C.border, borderRadius: 3, marginBottom: 10 },
  barFill:         { height: 6, borderRadius: 3 },
  healthSub:       { fontSize: 13, color: C.creamMute },

  grid:            { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard:        { width: '47%', backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16, alignItems: 'center' },
  statVal:         { fontSize: 28, fontWeight: '700', color: C.cream },
  statLbl:         { fontSize: 11, color: C.creamMute, marginTop: 4, textAlign: 'center' },

  section:         { marginBottom: 20 },
  sectionLabel:    { fontSize: 11, color: C.creamMute, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '600', marginBottom: 12 },

  tagRow:          { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  tagDot:          { width: 8, height: 8, borderRadius: 4 },
  tagName:         { fontSize: 13, color: C.creamDim, width: 70 },
  tagBarBg:        { flex: 1, height: 6, backgroundColor: C.border, borderRadius: 3 },
  tagBarFill:      { height: 6, borderRadius: 3 },
  tagCount:        { fontSize: 13, color: C.cream, fontWeight: '600', width: 24, textAlign: 'right' },

  highlightCard:   { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16 },
  bigAvatar:       { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  bigAvatarText:   { fontSize: 22, fontWeight: '700' },
  highlightName:   { fontSize: 16, fontWeight: '600', color: C.cream, marginBottom: 3 },
  highlightSub:    { fontSize: 12, color: C.creamMute },

  recentRow:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  miniAvatar:      { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  miniAvatarText:  { fontSize: 13, fontWeight: '700' },
  recentName:      { flex: 1, fontSize: 14, color: C.cream },
  recentDate:      { fontSize: 12, color: C.creamMute },

  emptyCard:       { alignItems: 'center', paddingVertical: 60 },
  emptyText:       { fontSize: 14, color: C.creamMute, textAlign: 'center' },
});