import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Modal, ScrollView, AppState, Alert } from 'react-native';
import { initDatabase, saveSession } from '../database/database';
import { useIsFocused } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const CATEGORIES = ['Ders Çalışma', 'Kodlama', 'Proje', 'Kitap Okuma'];

export default function HomeScreen() {
  const { user, logout } = useContext(AuthContext);
  const userId = user?.id;
  const username = user?.username;
  const isFocused = useIsFocused();
  const [duration, setDuration] = useState(25); // dakika
  const [timeLeft, setTimeLeft] = useState(25 * 60); // saniye
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [distractionCount, setDistractionCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [resetOnSummaryClose, setResetOnSummaryClose] = useState(false);
  
  const intervalRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  // Veritabanını başlat
  useEffect(() => {
    initDatabase();
  }, []);

  if (!userId) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.title}>Önce giriş yapınız</Text>
      </View>
    );
  }

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  // AppState Listener - Dikkat Dağınıklığı Takibi
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [isRunning, distractionCount]);

  // Ekrandan çıkınca (Raporlar sekmesine geçince) dikkat dağınıklığı say ve duraklat
  useEffect(() => {
    if (!isFocused && isRunning) {
      setDistractionCount(prev => prev + 1);
      setIsRunning(false);
    }
  }, [isFocused, isRunning]);

  const handleAppStateChange = (nextAppState) => {
    if (isRunning) {
      if (nextAppState === 'background') {
        // Arka plana gitti - Dikkat dağınıklığı artır ve sayacı duraklat
        setDistractionCount(prev => prev + 1);
        setIsRunning(false);
      }
      // active olunca sayaç duraklamış kalır, "Devam Et" bekler
    }
    appStateRef.current = nextAppState;
  };

  const handleStart = () => {
    if (!isRunning) {
      setIsRunning(true);
    }
  };

  const handleLogoutPress = () => {
    const canLogout = !isRunning && timeLeft === duration * 60 && !showSummary;
    if (!canLogout) {
      if (isRunning) {
        setIsRunning(false); // süreyi duraklat
      }
      Alert.alert('Önce seansı bitir', 'Zamanlayıcı devam ederken veya duraklatılmışken çıkış yapamazsın. Seansı bitir ya da sıfırla.');
      return;
    }
    logout && logout();
  };

  const handlePause = () => {
    setIsRunning(false);
    const completedTime = duration * 60 - timeLeft;
    setSessionData({
      durationSeconds: completedTime,
      category: selectedCategory,
      distractions: distractionCount,
    });
    setResetOnSummaryClose(false);
    setShowSummary(true);
  };

  const handleFinishSession = () => {
    setIsRunning(false);
    const completedTime = duration * 60 - timeLeft;
    
    // Veriyi kaydet (saniye cinsinden)
    saveSession(selectedCategory, completedTime, distractionCount, userId);
    
    setSessionData({
      durationSeconds: completedTime,
      category: selectedCategory,
      distractions: distractionCount,
    });
    setResetOnSummaryClose(true);
    setShowSummary(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
    setDistractionCount(0);
    setShowSummary(false);
  };

  const handleSessionEnd = () => {
    setIsRunning(false);
    const completedTime = duration * 60 - timeLeft;
    
    // Veriyi kaydet (süre bittiğinde, saniye cinsinden)
    saveSession(selectedCategory, completedTime, distractionCount, userId);
    
    setSessionData({
      durationSeconds: completedTime,
      category: selectedCategory,
      distractions: distractionCount,
    });
    setResetOnSummaryClose(true);
    setShowSummary(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleDurationChange = (text) => {
    const num = parseInt(text) || 1;
    setDuration(num);
    if (!isRunning) {
      setTimeLeft(num * 60);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.welcomeText}>Merhaba, {username}</Text>
        {logout && (
          <TouchableOpacity onPress={handleLogoutPress} style={styles.logoutButton} activeOpacity={0.8}>
            <Text style={styles.logoutText}>Çıkış</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.title}>Odaklanma Zamanlayıcısı</Text>

      {/* Süre Ayarı */}
      {!isRunning && timeLeft === duration * 60 && (
        <View style={styles.durationContainer}>
          <Text style={styles.label}>Süre (dakika):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={duration.toString()}
            onChangeText={handleDurationChange}
            editable={!isRunning}
          />
        </View>
      )}

      {/* Kategori Seçimi */}
      <View style={styles.categoryContainer}>
        <Text style={styles.label}>Kategori:</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.categoryButton}
          onPress={() => !isRunning && setShowCategoryPicker(true)}
          disabled={isRunning}
        >
          <Text style={styles.categoryButtonText}>{selectedCategory}</Text>
        </TouchableOpacity>
      </View>

      {/* Zamanlayıcı */}
      <Text style={styles.timer}>{formatTime(timeLeft)}</Text>

      {/* Dikkat Dağınıklığı Sayacı */}
      <Text style={styles.distractionText}>Dikkat Dağınıklığı: {distractionCount}</Text>

      {/* Butonlar */}
      <View style={styles.buttonRow}>
        {!showSummary && timeLeft === duration * 60 && !isRunning ? (
          <>
            <TouchableOpacity activeOpacity={0.85} style={[styles.button, styles.startButton]} onPress={handleStart}>
              <Text style={styles.buttonText}>Başlat</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} style={[styles.button, styles.pauseButton, styles.disabledButton]} disabled onPress={() => {}}>
              <Text style={styles.buttonText}>Duraklat</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} style={[styles.button, styles.resetButton]} onPress={handleReset}>
              <Text style={styles.buttonText}>Sıfırla</Text>
            </TouchableOpacity>
          </>
        ) : !showSummary && isRunning ? (
          <>
            <TouchableOpacity activeOpacity={0.85} style={[styles.button, styles.pauseButton]} onPress={handlePause}>
              <Text style={styles.buttonText}>Duraklat</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} style={[styles.button, styles.finishButton]} onPress={handleFinishSession}>
              <Text style={styles.buttonText}>Seansı Bitir</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} style={[styles.button, styles.resetButton]} onPress={handleReset}>
              <Text style={styles.buttonText}>Sıfırla</Text>
            </TouchableOpacity>
          </>
        ) : !showSummary ? (
          <>
            <TouchableOpacity activeOpacity={0.85} style={[styles.button, styles.startButton]} onPress={handleStart}>
              <Text style={styles.buttonText}>Devam Et</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} style={[styles.button, styles.finishButton]} onPress={handleFinishSession}>
              <Text style={styles.buttonText}>Seansı Bitir</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} style={[styles.button, styles.resetButton]} onPress={handleReset}>
              <Text style={styles.buttonText}>Sıfırla</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>

      {/* Kategori Seçici Modal */}
      <Modal visible={showCategoryPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kategori Seç</Text>
            <View style={styles.modalTitleBorder} />
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.7}
                style={[
                  styles.categoryOption,
                  selectedCategory === cat && styles.categoryOptionSelected
                ]}
                onPress={() => {
                  setSelectedCategory(cat);
                  setShowCategoryPicker(false);
                }}
              >
                <Text style={[
                  styles.categoryOptionText,
                  selectedCategory === cat && styles.categoryOptionTextSelected
                ]}>{cat}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={() => setShowCategoryPicker(false)}
            >
              <Text style={styles.buttonText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Seans Özeti Modal */}
      <Modal visible={showSummary} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seans Özeti</Text>
            {sessionData && (
              <>
                <Text style={styles.summaryText}>Kategori: {sessionData.category}</Text>
                <Text style={styles.summaryText}>Süre: {Math.floor(sessionData.durationSeconds / 60)} dakika {sessionData.durationSeconds % 60} saniye</Text>
                <Text style={styles.summaryText}>Dikkat Dağınıklığı: {sessionData.distractions}</Text>
              </>
            )}
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={() => {
                setShowSummary(false);
                if (resetOnSummaryClose) {
                  handleReset();
                }
                setResetOnSummaryClose(false);
              }}
            >
              <Text style={styles.buttonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#0f1419' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 24, color: '#eaeef2' },
  durationContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  label: { fontSize: 16, fontWeight: '600', marginRight: 8, color: '#b6c2cf' },
  input: { borderWidth: 1, borderColor: '#1f2a37', borderRadius: 8, padding: 10, width: 70, textAlign: 'center', backgroundColor: '#121821', color: '#eaeef2', fontSize: 16, fontWeight: '700' },
  categoryContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, justifyContent: 'center' },
  categoryButton: { backgroundColor: '#1E88E5', paddingVertical: 12, paddingHorizontal: 22, borderRadius: 12, minWidth: 160, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  categoryButtonText: { color: '#eaeef2', fontSize: 16, fontWeight: '700' },
  categoryOption: { paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#1f2a37', width: '100%' },
  categoryOptionSelected: { backgroundColor: '#1f2a37' },
  categoryOptionText: { fontSize: 18, color: '#b6c2cf', textAlign: 'center' },
  categoryOptionTextSelected: { color: '#1E88E5', fontWeight: '700' },
  timer: { fontSize: 64, fontWeight: '800', marginVertical: 28, color: '#eaeef2' },
  distractionText: { fontSize: 16, marginBottom: 24, color: '#E53935', fontWeight: '700' },
  buttonRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  button: { paddingVertical: 14, paddingHorizontal: 26, borderRadius: 12, minWidth: 120, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  startButton: { backgroundColor: '#4CAF50' },
  pauseButton: { backgroundColor: '#FF9800' },
  resetButton: { backgroundColor: '#607D8B' },
  finishButton: { backgroundColor: '#E53935' },
  buttonText: { color: '#eaeef2', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#121821', padding: 26, borderRadius: 16, width: '86%', alignItems: 'center', borderWidth: 1, borderColor: '#1f2a37' },
  modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 12, color: '#eaeef2' },
  modalTitleBorder: { width: '100%', height: 1, backgroundColor: '#1f2a37', marginBottom: 16 },
  disabledButton: { opacity: 0.5 },
  summaryText: { fontSize: 16, marginBottom: 8, color: '#b6c2cf' },
  closeButton: { backgroundColor: '#1E88E5', marginTop: 16 },
  topRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  welcomeText: { color: '#b6c2cf', fontSize: 14, fontWeight: '600' },
  logoutButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#E53935', borderRadius: 10 },
  logoutText: { color: '#eaeef2', fontSize: 13, fontWeight: '700' },
});
