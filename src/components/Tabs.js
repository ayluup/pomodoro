import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MODES, COLORS } from './utils/constants';

export default function Tabs({ currentMode, onModeChange }) {
  return (
    <View style={styles.container}>
      {Object.values(MODES).map((mode) => (
        <TouchableOpacity
          key={mode.id}
          onPress={() => onModeChange(mode)}
          style={[styles.tab, currentMode === mode.id && styles.activeTab]}
        >
          <Text style={[styles.text, currentMode === mode.id && styles.activeText]}>
            {mode.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-around', width: '90%', marginBottom: 20 },
  tab: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10, backgroundColor: '#E0E0E0' },
  activeTab: { backgroundColor: COLORS.primary },
  text: { fontWeight: 'bold', color: '#666' },
  activeText: { color: 'white' }
});