import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C } from '../constants/colors';

// `Screen` mirrors the type used in App.tsx so nav props stay consistent
export type Screen = 'home' | 'contacts' | 'overview';

interface Props {
  active: Screen;
  onNavigate: (screen: Screen) => void;
  onAdd: () => void;
  lang: 'ar' | 'en';
}

export function BottomNav({ active, onNavigate, onAdd, lang }: Props) {
  const isAr = lang === 'ar';

  // tabs do not include the add button; it will float above the bar
  const tabs: { id: Screen; icon: string }[] = [
    { id: 'home',     icon: '🏠' },
    { id: 'contacts', icon: '👥' },
    { id: 'overview', icon: '📊' },
  ];

  return (
    <View style={s.container}>
      {tabs.map((tab) => {
        return (
          <TouchableOpacity
            key={tab.id}
            style={[s.tab, active === tab.id && s.tabActive]}
            onPress={() => onNavigate(tab.id)}
          >
            <Text
              style={[s.tabIcon, active === tab.id && s.tabIconActive]}
            >
              {tab.icon}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* floating add button centered above nav */}
      <TouchableOpacity style={s.addFloating} onPress={onAdd}>
        <Text style={s.addFloatingText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    height: 60,
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 5,
    shadowColor: '#00000000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tab: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: C.gold,
    width: 0.9 * 60, // 90% of nav height to make it a pill shape
    height: 40,
    borderRadius: 24,
  },
  tabIcon: { fontSize: 24, color: C.creamMute },
  tabIconActive: { color: C.surface },
  addFloating: {
    position: 'relative',
    width: 50,
    height:50,
    borderRadius: 27.5,
    backgroundColor: C.gold,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  addFloatingText: {
    fontSize: 28,
    color: '#0c1c14',
    lineHeight: 32,
  },
});