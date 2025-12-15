import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { registerUser } from '../database/database';

export default function RegisterScreen({ onSuccess, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {
    if (!username.trim() || !password) {
      Alert.alert('Uyarı', 'Kullanıcı adı ve şifre giriniz');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Uyarı', 'Şifreler eşleşmiyor');
      return;
    }
    setLoading(true);
    try {
      const result = registerUser(username.trim(), password);
      if (result.success) {
        onSuccess(result.user);
      } else if (result.error === 'USERNAME_TAKEN') {
        Alert.alert('Hata', 'Bu kullanıcı adı zaten kayıtlı');
      } else {
        Alert.alert('Hata', 'Kayıt sırasında sorun oluştu');
      }
    } catch (e) {
      Alert.alert('Hata', 'Kayıt sırasında sorun oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>

      <TextInput
        style={styles.input}
        placeholder="Kullanıcı Adı"
        placeholderTextColor="#6b7280"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        placeholderTextColor="#6b7280"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre (Tekrar)"
        placeholderTextColor="#6b7280"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
      />

      <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={handleRegister} activeOpacity={0.85} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Kaydediliyor...' : 'Kayıt Ol'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={onSwitchToLogin}>
        <Text style={styles.linkText}>Hesabın var mı? Giriş yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1419', padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#eaeef2', textAlign: 'center', marginBottom: 24 },
  input: { backgroundColor: '#121821', color: '#eaeef2', borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#1f2a37' },
  button: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 8 },
  registerButton: { backgroundColor: '#4CAF50' },
  buttonText: { color: '#eaeef2', fontSize: 16, fontWeight: '700' },
  linkButton: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#4FACFE', fontSize: 14, fontWeight: '600' },
});
