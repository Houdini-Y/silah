import { View, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { useStore } from './store/contactsStore';
import { HomeScreen } from './components/HomeScreen';
import { ContactsScreen } from './components/ContactsScreen';
import { ContactDetailScreen } from './components/ContactDetailScreen';
import { AddContactScreen } from './components/AddContactScreen';
import { BottomNav } from './components/BottomNav';
import { Contact } from './types/Contact';
import { C } from './constants/colors';
import { requestNotifPermission, scheduleReminder } from './utils/notifications';
import { OverviewScreen } from './components/OverviewScreen';
type Screen = 'home' | 'contacts' | 'overview';

export default function App() {
  const { lang, contacts } = useStore();
  const [screen,    setScreen]    = useState<Screen>('home');
  const [viewing,   setViewing]   = useState<Contact | null>(null);
  const [editing,   setEditing]   = useState<Contact | null>(null);
  const [addingNew, setAddingNew] = useState(false);

  const showNav = !viewing && !editing && !addingNew;

  // Request notification permission on first launch
  useEffect(() => {
    requestNotifPermission();
  }, []);

  // Reschedule all reminders whenever contacts change
  useEffect(() => {
    contacts.forEach(c => {
      if (c.lastCalled) scheduleReminder(c);
    });
  }, [contacts]);

  return (
    <View style={s.container}>

      {(addingNew || editing) && (
        <AddContactScreen
          contact={editing ?? undefined}
          lang={lang}
          onBack={() => { setAddingNew(false); setEditing(null); }}
        />
      )}

      {!addingNew && !editing && viewing && (
        <ContactDetailScreen
          contact={viewing}
          lang={lang}
          onBack={() => setViewing(null)}
          onEdit={() => { setEditing(viewing); setViewing(null); }}
        />
      )}

      {!addingNew && !editing && !viewing && (
        <>
          {screen === 'home'     && <HomeScreen />}
          {screen === 'contacts' && (
            <ContactsScreen
              lang={lang}
              onView={c => setViewing(c)}
            />
          )}
          {screen === 'overview' && <OverviewScreen />}
        </>
      )}

      {showNav && (
        <BottomNav
          active={screen}
          onNavigate={setScreen}
          onAdd={() => setAddingNew(true)}
          lang={lang}
        />
      )}

    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
});