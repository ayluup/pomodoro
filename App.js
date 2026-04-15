import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, SafeAreaView, AppState, View } from 'react-native';
import { Audio } from 'expo-av';
import Tabs from './src/components/Tabs';
import Timer from './src/components/Timer'; 
import { MODES, COLORS } from './src/components/utils/constants';

export default function App() {
  const [activeMode, setActiveMode] = useState('PM');
  const [time, setTime] = useState(MODES.PM.time);
  const [isActive, setIsActive] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);

  const alarmSoundRef = useRef(null);
  const appState = useRef(AppState.currentState);

  // 3. APAGAR AL BLOQUEAR
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/active/) && nextAppState === 'background') {
        if (isAlarmPlaying) {
          stopAlarm();
        }
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [isAlarmPlaying]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
  }, []);

  const playClick = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('./assets/click.mp3'),
        { shouldPlay: true }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) sound.unloadAsync();
      });
    } catch (e) { console.log(e); }
  };

  const playAlarm = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('./assets/alarma.mp3'),
        { shouldPlay: true, isLooping: true }
      );
      alarmSoundRef.current = sound;
      setIsAlarmPlaying(true);
    } catch (e) { console.log(e); }
  };

  const stopAlarm = async () => {
    if (alarmSoundRef.current) {
      await alarmSoundRef.current.stopAsync();
      await alarmSoundRef.current.unloadAsync();
      alarmSoundRef.current = null;
    }
    setIsAlarmPlaying(false);
    setIsActive(false);
    setTime(MODES[activeMode].time); 
  };

  useEffect(() => {
    let interval = null;
    if (isActive && time > 0) {
      interval = setInterval(() => setTime((t) => t - 1), 1000);
    } else {
      clearInterval(interval);
    }

    if (time === 0 && isActive) {
      setIsActive(false);
      playAlarm();
    }

    return () => clearInterval(interval);
  }, [isActive, time]);

  const handleStartStop = () => {
    playClick();
    if (isAlarmPlaying) {
      stopAlarm();
      return;
    }
    setIsActive(!isActive);
  };

  const handleModeChange = (mode) => {
    playClick();
    if (isAlarmPlaying) stopAlarm();
    setIsActive(false);
    setActiveMode(mode.id);
    setTime(mode.time);
  };

  // 1. CAMBIO DE COLOR DE FONDO
  const dynamicBg = isAlarmPlaying ? "#E74C3C" : COLORS.bg;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dynamicBg }]}>
      <Text style={styles.title}>Pomodoro App</Text>
      
      <Tabs currentMode={activeMode} onModeChange={handleModeChange} />

      <Timer time={time} isAlarmPlaying={isAlarmPlaying} />

      <TouchableOpacity 
        style={[
          styles.button, 
          { backgroundColor: isAlarmPlaying ? 'black' : (isActive ? COLORS.primary : COLORS.success) }
        ]} 
        onPress={handleStartStop}
      >
        <Text style={styles.buttonText}>
          {isAlarmPlaying ? 'DETENER ALARMA' : (isActive ? 'PARAR' : 'INICIAR')}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    marginBottom: 40, 
    color: COLORS.text 
  },
  button: { 
    width: '80%', 
    padding: 20, 
    borderRadius: 15, 
    alignItems: 'center', 
    elevation: 3 
  },
  buttonText: { 
    color: 'white', 
    fontSize: 24, 
    fontWeight: 'bold' 
  }
});