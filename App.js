import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, SafeAreaView, View } from 'react-native';
import { Audio } from 'expo-av';
import Tabs from './src/components/Tabs';
import Timer from './src/components/Timer'; 
import { MODES, COLORS } from './src/components/utils/constants';

export default function App() {
  const [activeMode, setActiveMode] = useState('PM');
  const [time, setTime] = useState(MODES.PM.time);
  const [isActive, setIsActive] = useState(false);
  
  // Referencia para controlar el sonido de la alarma y poder pararlo
  const alarmSoundRef = useRef(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
  }, []);

  // Función para sonidos cortos (click)
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

  // Función para la alarma (con loop para que no pare sola)
  const playAlarm = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('./assets/alarma.mp3'), // Asegurate que el archivo se llame así
        { shouldPlay: true, isLooping: true }
      );
      alarmSoundRef.current = sound;
    } catch (e) { console.log(e); }
  };

  // Función para detener la alarma definitivamente
  const stopAlarm = async () => {
    if (alarmSoundRef.current) {
      await alarmSoundRef.current.stopAsync();
      await alarmSoundRef.current.unloadAsync();
      alarmSoundRef.current = null;
    }
  };

  useEffect(() => {
    let interval = null;
    if (isActive && time > 0) {
      interval = setInterval(() => setTime((t) => t - 1), 1000);
    } else {
      clearInterval(interval);
    }

    // Cuando el tiempo llega a cero
    if (time === 0 && isActive) {
      setIsActive(false);
      playAlarm();
    }

    return () => clearInterval(interval);
  }, [isActive, time]);

  const handleStartStop = () => {
    playClick();

    // Si el tiempo está en 0 (la alarma está sonando)
    if (time === 0) {
      stopAlarm();
      setTime(MODES[activeMode].time); // Reinicia el tiempo
      return;
    }

    // Si el reloj está corriendo y apretamos PARAR
    if (isActive) {
      setIsActive(false);
      // Opcional: si querés que reinicie el tiempo cada vez que ponés PARAR:
      // setTime(MODES[activeMode].time); 
    } else {
      setIsActive(true);
    }
  };

  const handleModeChange = (mode) => {
    playClick();
    stopAlarm(); // Paramos la alarma si cambiamos de pestaña
    setIsActive(false);
    setActiveMode(mode.id);
    setTime(mode.time);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.bg }]}>
      <Text style={styles.title}>Pomodoro App</Text>
      
      <Tabs currentMode={activeMode} onModeChange={handleModeChange} />

      <Timer time={time} />

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: isActive ? COLORS.primary : COLORS.success }]} 
        onPress={handleStartStop}
      >
        <Text style={styles.buttonText}>
          {time === 0 ? 'DETENER ALARMA' : (isActive ? 'PARAR' : 'INICIAR')}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 40, color: COLORS.text },
  button: { width: '80%', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 3 },
  buttonText: { color: 'white', fontSize: 24, fontWeight: 'bold' }
});