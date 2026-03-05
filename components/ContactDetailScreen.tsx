import {
  View, Text, ScrollView,
  TouchableOpacity, StyleSheet, Alert, Linking
} from 'react-native';
import { useState } from 'react';
import { useStore } from '../store/contactsStore';
import { getDaysUntil, Contact } from '../types/Contact';
import { C, TAGS } from '../constants/colors';
import { Avatar } from './Avatar';
import { TagBadge } from './TagBadge';
import { PostCallModal } from './PostCallModal';

// ── Helpers ──────────────────────────────────────────────────────
const formatDate = (iso: string, lang: 'ar' | 'en') =>
  new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

const dueColor = (days: number) =>
  days <= 0 ? C.danger : days <= 2 ? C.gold : C.safe;

const formatDue = (days: number, lang: 'ar' | 'en') => {
  if (days <= -30) return lang === 'ar' ? 'متأخر جداً'                  : 'Very overdue';
  if (days < 0)   return lang === 'ar' ? `متأخر ${Math.abs(days)} أيام` : `${Math.abs(days)}d overdue`;
  if (days === 0) return lang === 'ar' ? 'اليوم'                        : 'Due today';
  if (days === 1) return lang === 'ar' ? 'غداً'                         : 'Tomorrow';
  return lang === 'ar' ? `بعد ${days} أيام` : `In ${days}d`;
};

// ── Props ─────────────────────────────────────────────────────────
interface Props {
  contact: Contact;
  onBack: () => void;
  onEdit: () => void;
  lang: 'ar' | 'en';
}

// ── Component ─────────────────────────────────────────────────────
export function ContactDetailScreen({ contact, onBack, onEdit, lang }: Props) {
  const { deleteContact, markCalled, contacts } = useStore();
  const [showModal, setShowModal] = useState(false);
  const isAr = lang === 'ar';

  // Always read live data from store so UI updates after markCalled
  const live = contacts.find(c => c.id === contact.id) ?? contact;
  const days = getDaysUntil(live);

  // ── Actions ───────────────────────────────────────────────────
  const handleCall = async () => {
    if (!live.phone) return;
    const url = `tel:${live.phone}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
  };

  const handleDelete = () => {
    Alert.alert(
      isAr ? `حذف ${live.name}؟` : `Remove ${live.name}?`,
      isAr
        ? 'سيتم حذف الجهة وكل سجل المكالمات.'
        : 'This will remove them and delete all call history.',
      [
        { text: isAr ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: isAr ? 'حذف' : 'Remove',
          style: 'destructive',
          onPress: () => { deleteContact(live.id); onBack(); },
        },
      ]
    );
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Header ── */}
      <View style={[s.header, isAr && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity onPress={onBack}>
          <Text style={s.backBtn}>{isAr ? '→ رجوع' : '← Back'}</Text>
        </TouchableOpacity>
        <View style={[s.headerActions, isAr && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity onPress={onEdit} style={s.editBtn}>
            <Text style={{ fontSize: 14 }}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={s.deleteBtn}>
            <Text style={{ fontSize: 14 }}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content}>

        {/* ── Profile ── */}
        <View style={[s.profile, isAr && { flexDirection: 'row-reverse' }]}>
          <Avatar name={live.name} tag={live.tag} size={76} />
          <View style={{ flex: 1, gap: 8, alignItems: isAr ? 'flex-end' : 'flex-start' }}>
            <View style={{ flexDirection: isAr ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }}>
              <Text style={s.profileName}>{live.name}</Text>
              {live.priority && <Text style={{ color: C.gold, fontSize: 16 }}>★</Text>}
            </View>
            <TagBadge tag={live.tag} lang={lang} />
          </View>
        </View>

        {/* ── Phone row ── */}
        {live.phone ? (
          <TouchableOpacity
            onPress={handleCall}
            style={[s.phoneRow, isAr && { flexDirection: 'row-reverse' }]}
          >
            <Text style={{ fontSize: 18 }}>📞</Text>
            <Text style={s.phoneText}>{live.phone}</Text>
            <Text style={s.tapToCall}>
              {isAr ? 'اضغط للاتصال' : 'Tap to Call'}
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* ── Stats ── */}
        <View style={[s.statsRow, isAr && { flexDirection: 'row-reverse' }]}>
          <View style={s.statBox}>
            <Text style={[s.statVal, { color: dueColor(days) }]}>
              {formatDue(days, lang)}
            </Text>
            <Text style={s.statLbl}>
              {isAr ? 'الاتصال القادم' : 'Next call'}
            </Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statVal}>
              {isAr ? `كل ${live.interval} أيام` : `Every ${live.interval}d`}
            </Text>
            <Text style={s.statLbl}>
              {isAr ? 'التكرار' : 'Frequency'}
            </Text>
          </View>
        </View>

        {/* ── Last called ── */}
        <View style={[s.infoRow, isAr && { flexDirection: 'row-reverse' }]}>
          <Text style={s.infoLabel}>
            {isAr ? 'آخر مكالمة' : 'Last called'}
          </Text>
          <Text style={s.infoValue}>
            {live.lastCalled
              ? formatDate(live.lastCalled, lang)
              : (isAr ? 'لم يُتصل بعد' : 'Never')}
          </Text>
        </View>

        {/* ── Next call note ── */}
        {live.nextCallNote ? (
          <View style={s.noteBox}>
            <Text style={s.noteLabel}>
              {isAr ? 'ذكّرني أسأل عن' : 'Remind me to ask'}
            </Text>
            <Text style={[s.noteText, { textAlign: isAr ? 'right' : 'left' }]}>
              {live.nextCallNote}
            </Text>
          </View>
        ) : null}

        {/* ── Permanent notes ── */}
        {live.notes ? (
          <View style={s.card}>
            <Text style={s.noteLabel}>
              {isAr ? 'ملاحظات' : 'Notes'}
            </Text>
            <Text style={[s.noteText, { textAlign: isAr ? 'right' : 'left' }]}>
              {live.notes}
            </Text>
          </View>
        ) : null}

        {/* ── Call history ── */}
        {live.callHistory.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={s.sectionLabel}>
              {isAr ? 'سجل المكالمات' : 'Call History'}
            </Text>
            {live.callHistory.slice(0, 5).map((h, i) => (
              <View key={i} style={[s.historyRow, isAr && { alignItems: 'flex-end' }]}>
                <Text style={s.historyDate}>
                  {formatDate(h.date, lang)}
                </Text>
                {h.note ? (
                  <Text style={[s.historyNote, { textAlign: isAr ? 'right' : 'left' }]}>
                    {h.note}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Bottom buttons ── */}
      <View style={s.footer}>
        <View style={{ flexDirection: isAr ? 'row-reverse' : 'row', gap: 10 }}>
          {live.phone ? (
            <TouchableOpacity style={[s.actionBtn, s.callPhoneBtn]} onPress={handleCall}>
              <Text style={[s.actionBtnText, { color: C.safe }]}>
                📞 {isAr ? 'اتصل' : 'Call'}
              </Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[s.actionBtn, s.logBtn, !live.phone && { flex: 1 }]}
            onPress={() => setShowModal(true)}
          >
            <Text style={[s.actionBtnText, { color: '#0c1c14' }]}>
              {isAr ? '✓ سجّل مكالمة' : '✓ Log Call'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Post-Call Modal ── */}
      <PostCallModal
        contact={live}
        visible={showModal}
        lang={lang}
        onClose={() => setShowModal(false)}
        onConfirm={(nextNote, newInterval) => {
          markCalled(live.id, nextNote, newInterval);
          setShowModal(false);
        }}
      />

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const s = StyleSheet.create({
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 52, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn:       { color: C.creamDim, fontSize: 14 },
  headerActions: { flexDirection: 'row', gap: 8 },
  editBtn:       { backgroundColor: C.goldSoft, borderWidth: 1, borderColor: C.goldBorder, borderRadius: 10, padding: 9 },
  deleteBtn:     { backgroundColor: C.dangerBg, borderWidth: 1, borderColor: C.danger + '30', borderRadius: 10, padding: 9 },

  content:       { padding: 18 },

  profile:       { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  profileName:   { fontSize: 26, fontWeight: '700', color: C.cream },

  phoneRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.safeBg, borderWidth: 1, borderColor: C.safe + '40', borderRadius: 14, padding: 14, marginBottom: 14 },
  phoneText:     { flex: 1, fontSize: 15, fontWeight: '600', color: C.safe },
  tapToCall:     { fontSize: 12, color: C.safe, opacity: 0.7 },

  statsRow:      { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statBox:       { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, alignItems: 'center' },
  statVal:       { fontSize: 16, fontWeight: '700', color: C.cream, marginBottom: 4, textAlign: 'center' },
  statLbl:       { fontSize: 11, color: C.creamMute, textAlign: 'center' },

  infoRow:       { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel:     { fontSize: 12, color: C.creamMute },
  infoValue:     { fontSize: 14, color: C.cream, fontWeight: '500' },

  noteBox:       { backgroundColor: C.goldSoft, borderWidth: 1, borderColor: C.goldBorder, borderRadius: 14, padding: 14, marginBottom: 12 },
  card:          { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, marginBottom: 12 },
  noteLabel:     { fontSize: 11, color: C.gold, letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: '600', marginBottom: 6 },
  noteText:      { fontSize: 14, color: C.creamDim, lineHeight: 22 },

  sectionLabel:  { fontSize: 11, color: C.creamMute, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '600', marginBottom: 10 },
  historyRow:    { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  historyDate:   { fontSize: 12, color: C.creamMute, marginBottom: 3 },
  historyNote:   { fontSize: 13, color: C.creamDim, lineHeight: 20 },

  footer:        { padding: 16, paddingBottom: 28, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border },
  actionBtn:     { flex: 1, borderRadius: 14, padding: 15, alignItems: 'center', justifyContent: 'center' },
  callPhoneBtn:  { backgroundColor: C.safeBg, borderWidth: 1, borderColor: C.safe + '40' },
  logBtn:        { backgroundColor: C.gold },
  actionBtnText: { fontWeight: '700', fontSize: 15 },
});