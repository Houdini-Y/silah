import {
  View, Text, TextInput, TouchableOpacity,
  Modal, StyleSheet, ScrollView
} from 'react-native';
import { useState, useEffect } from 'react';
import { Contact } from '../types/Contact';
import { C } from '../constants/colors';

interface Props {
  contact: Contact | null;
  visible: boolean;
  onClose: () => void;
  onConfirm: (nextNote: string, newInterval: number) => void;
  lang: 'ar' | 'en';
}

const INTERVALS = [1, 2, 3, 5, 7, 10, 14, 21, 30];

export function PostCallModal({ contact, visible, onClose, onConfirm, lang }: Props) {
  const isAr = lang === 'ar';
  const [nextNote,   setNextNote]   = useState('');
  const [interval,   setInterval]   = useState(contact?.interval ?? 7);
  const [changeIt,   setChangeIt]   = useState(false);

  // Reset every time modal opens for a new contact
  useEffect(() => {
    if (visible && contact) {
      setNextNote('');
      setInterval(contact.interval);
      setChangeIt(false);
    }
  }, [visible, contact]);

  if (!contact) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Dark overlay */}
      <TouchableOpacity
        style={s.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Sheet — stop tap from closing */}
        <TouchableOpacity activeOpacity={1} style={s.sheet}>
          <ScrollView>

            {/* Handle bar */}
            <View style={s.handle} />

            {/* Title */}
            <Text style={[s.title, { textAlign: isAr ? 'right' : 'left' }]}>
              {isAr ? `مكالمة مع ${contact.name} ✓` : `Called ${contact.name} ✓`}
            </Text>
            <Text style={[s.sub, { textAlign: isAr ? 'right' : 'left' }]}>
              {isAr ? 'ماذا تسأل في المرة القادمة؟' : 'What to ask next time?'}
            </Text>

            {/* Next note input */}
            <View style={s.noteBox}>
              <TextInput
                value={nextNote}
                onChangeText={setNextNote}
                placeholder={
                  isAr
                    ? 'مثال: اسأل عن نتيجة الفحص...'
                    : 'e.g. Ask about the test results...'
                }
                placeholderTextColor={C.creamMute}
                multiline
                numberOfLines={3}
                style={[s.noteInput, { textAlign: isAr ? 'right' : 'left' }]}
              />
            </View>

            {/* Interval adjust — collapsible */}
            <TouchableOpacity
              style={[s.urgentRow, isAr && { flexDirection: 'row-reverse' }]}
              onPress={() => setChangeIt(!changeIt)}
            >
              <Text style={s.urgentIcon}>⚡</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.urgentTitle, { textAlign: isAr ? 'right' : 'left' }]}>
                  {isAr ? 'شيء مهم؟ عدّل موعد المكالمة القادمة' : 'Urgent? Adjust next call timing'}
                </Text>
              </View>
              <Text style={{ color: C.creamMute, fontSize: 12 }}>
                {changeIt ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {changeIt && (
              <View style={s.intervalBox}>
                <Text style={[s.intervalLabel, { textAlign: isAr ? 'right' : 'left' }]}>
                  {isAr ? 'اتصل مرة أخرى خلال:' : 'Call again in:'}
                </Text>
                <View style={s.chipRow}>
                  {INTERVALS.map(d => (
                    <TouchableOpacity
                      key={d}
                      onPress={() => setInterval(d)}
                      style={[s.chip, interval === d && s.chipActive]}
                    >
                      <Text style={[s.chipText, interval === d && { color: C.gold, fontWeight: '600' }]}>
                        {d === 1  ? (isAr ? 'يومياً'     : 'Daily')
                       : d === 7  ? (isAr ? 'أسبوعياً'   : 'Weekly')
                       : d === 14 ? (isAr ? 'أسبوعين'    : '2 weeks')
                       : d === 30 ? (isAr ? 'شهر'        : 'Month')
                       : isAr ? `${d} أيام` : `${d}d`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Buttons */}
            <View style={[s.btnRow, isAr && { flexDirection: 'row-reverse' }]}>
              <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
                <Text style={s.cancelText}>
                  {isAr ? 'إلغاء' : 'Cancel'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.confirmBtn}
                onPress={() => onConfirm(nextNote, changeIt ? interval : contact.interval)}
              >
                <Text style={s.confirmText}>
                  {isAr ? '✓ حفظ وتأكيد' : '✓ Save & Confirm'}
                </Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet:          { backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, borderTopWidth: 1, borderTopColor: C.border },
  handle:         { width: 40, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },

  title:          { fontSize: 20, fontWeight: '700', color: C.cream, marginBottom: 4 },
  sub:            { fontSize: 13, color: C.gold, marginBottom: 16 },

  noteBox:        { backgroundColor: C.surface, borderWidth: 1, borderColor: C.goldBorder, borderRadius: 14, padding: 14, marginBottom: 14 },
  noteInput:      { color: C.cream, fontSize: 14, lineHeight: 22, minHeight: 70 },

  urgentRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, marginBottom: 4 },
  urgentIcon:     { fontSize: 16 },
  urgentTitle:    { fontSize: 13, color: C.creamDim, flex: 1 },

  intervalBox:    { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, marginBottom: 14, marginTop: 4 },
  intervalLabel:  { fontSize: 12, color: C.creamMute, marginBottom: 12 },
  chipRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:           { borderWidth: 1, borderColor: C.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  chipActive:     { borderColor: C.goldBorder, backgroundColor: C.goldSoft },
  chipText:       { fontSize: 12, color: C.creamMute },

  btnRow:         { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelBtn:      { flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, alignItems: 'center' },
  cancelText:     { color: C.creamDim, fontWeight: '600', fontSize: 14 },
  confirmBtn:     { flex: 2, backgroundColor: C.gold, borderRadius: 14, padding: 14, alignItems: 'center' },
  confirmText:    { color: '#0c1c14', fontWeight: '700', fontSize: 14 },
});