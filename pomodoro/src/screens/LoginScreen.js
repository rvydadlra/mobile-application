import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { loginUser } from '../database/database';

export default function LoginScreen({ onSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!username.trim() || !password) {
      Alert.alert('Uyarı', 'Kullanıcı adı ve şifre giriniz');
      return;
    }
    setLoading(true);
    try {
      const result = loginUser(username.trim(), password);
      if (result.success) {
        onSuccess(result.user);
      } else {
        Alert.alert('Hata', 'Kullanıcı adı veya şifre hatalı');
      }
    } catch (e) {
      Alert.alert('Hata', 'Giriş sırasında sorun oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giriş Yap</Text>

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

      <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={handleLogin} activeOpacity={0.85} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={onSwitchToRegister}>
        <Text style={styles.linkText}>Hesabın yok mu? Kayıt ol</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1419', padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#eaeef2', textAlign: 'center', marginBottom: 24 },
  input: { backgroundColor: '#121821', color: '#eaeef2', borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#1f2a37' },
  button: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 8 },
  loginButton: { backgroundColor: '#1E88E5' },
  buttonText: { color: '#eaeef2', fontSize: 16, fontWeight: '700' },
  linkButton: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#4FACFE', fontSize: 14, fontWeight: '600' },
});
