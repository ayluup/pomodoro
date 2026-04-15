import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from './utils/constants';

export default function Timer({ time, isAlarmPlaying }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <View style={styles.container}>
      <Text style={[
        styles.timeText, 
        isAlarmPlaying && { color: 'white' }
      ]}>
        {formatTime(time)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 40 },
  timeText: { fontSize: 90, fontWeight: 'bold', color: COLORS.text },
});