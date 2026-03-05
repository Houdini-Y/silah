import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet
} from 'react-native';
import { useState } from 'react';
import { useStore } from '../store/contactsStore';
import { Contact, uid } from '../types/Contact';
import { C, TAGS } from '../constants/colors';
import { pickContactFromPhone } from '../utils/pickContact';

interface Props {
  contact?: Contact;
  onBack: () => void;
  lang: 'ar' | 'en';
}

const INTERVALS = [1, 2, 3, 5, 7, 10, 14, 21, 30];

export function AddContactScreen({ contact, onBack, lang }: Props) {
  const { addContact, updateContact } = useStore();
  const isEdit = !!contact;
  const isAr = lang === 'ar';

  const [name,         setName]         = useState(contact?.name         ?? '');
  const [phone,        setPhone]        = useState(contact?.phone        ?? '');
  const [tag,          setTag]          = useState(contact?.tag          ?? 'family');
  const [interval,     setInterval]     = useState(contact?.interval     ?? 7);
  const [priority,     setPriority]     = useState(contact?.priority     ?? false);
  const [notes,        setNotes]        = useState(contact?.notes        ?? '');
  const [nextCallNote, setNextCallNote] = useState(contact?.nextCallNote ?? '');

  // ── Import from phone contacts ──────────────────────────────────
  const handleImport = async () => {
    const result = await pickContactFromPhone(lang);
    if (result) {
      if (result.name)  setName(result.name);
      if (result.phone) setPhone(result.phone);
    }
  };

  // ── Save ────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!name.trim()) return;

    const saved: Contact = {
      ...(contact ?? { id: uid(), lastCalled: null, callHistory: [] }),
      name: name.trim(),
      phone: phone.trim(),
      tag: tag as Contact['tag'],
      interval,
      priority,
      notes,
      nextCallNote,
    };

    if (isEdit) {
      updateContact(saved);
    } else {
      addContact(saved);
    }
    onBack();
  };

  const lbl = (text: string) => (
    <Text style={s.label}>{text}</Text>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Header ── */}
      <View style={[s.header, isAr && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity onPress={onBack}>
          <Text style={s.backBtn}>{isAr ? '→ رجوع' : '← Back'}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>
          {isEdit
            ? (isAr ? 'تعديل' : 'Edit Contact')
            : (isAr ? 'أضف إلى دائرتك' : 'Add to Circle')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={s.content}>

        {/* ── Import button ── */}
        <TouchableOpacity onPress={handleImport} style={s.importBtn}>
          <Text style={s.importBtnText}>
            {isAr ? '📱 استيراد من جهات الاتصال' : '📱 Import from Phone Contacts'}
          </Text>
        </TouchableOpacity>

        {/* ── Name ── */}
        {lbl(isAr ? 'الاسم *' : 'Name *')}
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={isAr ? 'مثال: أمي، العم سعد...' : 'e.g. Mom, Uncle Saad...'}
          placeholderTextColor={C.creamMute}
          style={[s.input, { textAlign: isAr ? 'right' : 'left' }]}
        />

        {/* ── Phone ── */}
        {lbl(isAr ? 'رقم الجوال' : 'Phone (optional)')}
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="+966..."
          placeholderTextColor={C.creamMute}
          keyboardType="phone-pad"
          style={s.input}
        />

        {/* ── Tag ── */}
        {lbl(isAr ? 'العلاقة' : 'Relationship')}
        <View style={s.chipRow}>
          {(Object.keys(TAGS) as (keyof typeof TAGS)[]).map(k => (
            <TouchableOpacity
              key={k}
              onPress={() => setTag(k)}
              style={[
                s.chip,
                tag === k && { borderColor: TAGS[k].color, backgroundColor: TAGS[k].bg },
              ]}
            >
              <Text style={[
                s.chipText,
                tag === k && { color: TAGS[k].color, fontWeight: '600' },
              ]}>
                {isAr ? TAGS[k].labelAr : TAGS[k].label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Interval ── */}
        {lbl(isAr ? 'تكرار الاتصال' : 'Call Frequency')}
        <View style={s.chipRow}>
          {INTERVALS.map(d => (
            <TouchableOpacity
              key={d}
              onPress={() => setInterval(d)}
              style={[s.chip, interval === d && s.chipActiveGold]}
            >
              <Text style={[
                s.chipText,
                interval === d && { color: C.gold, fontWeight: '600' },
              ]}>
                {d === 1  ? (isAr ? 'يومياً'     : 'Daily')
               : d === 7  ? (isAr ? 'أسبوعياً'   : 'Weekly')
               : d === 14 ? (isAr ? 'كل أسبوعين' : 'Biweekly')
               : d === 30 ? (isAr ? 'شهرياً'      : 'Monthly')
               : `${d}d`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Priority toggle ── */}
        <TouchableOpacity
          style={[s.toggleRow, isAr && { flexDirection: 'row-reverse' }]}
          onPress={() => setPriority(!priority)}
        >
          <View>
            <Text style={s.toggleTitle}>
              {isAr ? 'جهة أولوية' : 'Priority Contact'}
            </Text>
            <Text style={s.toggleSub}>
              {isAr ? 'يظهر أولاً دائماً' : 'Always shown first'}
            </Text>
          </View>
          <View style={[s.toggle, priority && s.toggleOn]}>
            <View style={[s.toggleDot, priority && s.toggleDotOn]} />
          </View>
        </TouchableOpacity>

        {/* ── Next call note ── */}
        {lbl(isAr ? 'ذكّرني أسأل عن' : 'Remind me to ask...')}
        <TextInput
          value={nextCallNote}
          onChangeText={setNextCallNote}
          placeholder={isAr ? 'مثال: اسأل عن مشروعها الجديد...' : 'e.g. Ask about her new project...'}
          placeholderTextColor={C.creamMute}
          multiline
          numberOfLines={3}
          style={[s.input, s.inputMulti, { textAlign: isAr ? 'right' : 'left' }]}
        />

        {/* ── Notes ── */}
        {lbl(isAr ? 'ملاحظات' : 'Notes')}
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder={isAr ? 'أشياء تريد تذكّرها...' : 'Things to remember...'}
          placeholderTextColor={C.creamMute}
          multiline
          numberOfLines={3}
          style={[s.input, s.inputMulti, { textAlign: isAr ? 'right' : 'left' }]}
        />

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Save button ── */}
      <View style={s.footer}>
        <TouchableOpacity
          onPress={handleSave}
          style={[s.saveBtn, !name.trim() && { opacity: 0.4 }]}
        >
          <Text style={s.saveBtnText}>
            {isEdit
              ? (isAr ? '✓ حفظ التغييرات' : '✓ Save Changes')
              : (isAr ? '✓ أضف إلى دائرتك' : '✓ Add to My Circle')}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const s = StyleSheet.create({
  header:         { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, paddingTop: 52, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn:        { color: C.creamDim, fontSize: 14 },
  headerTitle:    { fontSize: 20, fontWeight: '700', color: C.cream },
  content:        { padding: 18 },

  importBtn:      { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: 20 },
  importBtnText:  { color: C.creamDim, fontSize: 14 },

  label:          { fontSize: 11, color: C.creamMute, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 7, fontWeight: '600', marginTop: 4 },
  input:          { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 12, color: C.cream, fontSize: 14, marginBottom: 16 },
  inputMulti:     { minHeight: 80, textAlignVertical: 'top' },

  chipRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  chip:           { borderWidth: 1, borderColor: C.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  chipText:       { fontSize: 13, color: C.creamMute },
  chipActiveGold: { borderColor: C.goldBorder, backgroundColor: C.goldSoft },

  toggleRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, marginBottom: 18 },
  toggleTitle:    { fontSize: 14, color: C.cream, fontWeight: '600' },
  toggleSub:      { fontSize: 12, color: C.creamMute, marginTop: 2 },
  toggle:         { width: 44, height: 26, borderRadius: 13, backgroundColor: C.border, justifyContent: 'center', padding: 3 },
  toggleOn:       { backgroundColor: C.gold },
  toggleDot:      { width: 20, height: 20, borderRadius: 10, backgroundColor: C.creamMute },
  toggleDotOn:    { backgroundColor: '#0c1c14', alignSelf: 'flex-end' },

  footer:         { padding: 16, paddingBottom: 28, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border },
  saveBtn:        { backgroundColor: C.gold, borderRadius: 14, padding: 15, alignItems: 'center' },
  saveBtnText:    { color: '#0c1c14', fontWeight: '700', fontSize: 15 },
});