# Odaklanma Takibi ve Raporlama Uygulaması

Bu proje, Sakarya Üniversitesi Bilgisayar Mühendisliği Bölümü  
**BSM 447 – Mobil Uygulama Geliştirme** dersi kapsamında geliştirilmiştir.

## 🎯 Projenin Amacı
Günümüzde dijital dikkat dağınıklığı, bireylerin verimli çalışmasını zorlaştıran önemli bir problemdir.  
Bu uygulama, kullanıcıların kendi başlattıkları odaklanma seanslarını takip etmelerini, dikkat dağınıklıklarını fark etmelerini ve bu verileri analiz etmelerini amaçlamaktadır.

Uygulama, Pomodoro tekniğine benzer bir zamanlayıcı yapısı sunmakta ve seans süresince kullanıcının uygulamadan ayrılıp ayrılmadığını takip etmektedir.

---

## 🛠 Kullanılan Teknolojiler
- React Native
- Expo
- React Navigation
- React Native AppState API
- Expo SQLite
- react-native-chart-kit

---

## 📱 Uygulama Özellikleri
- Kullanıcı girişi ve kayıt sistemi
- Ayarlanabilir odaklanma süresi (Pomodoro)
- Kategori bazlı odaklanma seansları
- Dikkat dağınıklığı algılama (arka plana geçiş / sekme değişimi)
- Seans özeti gösterimi
- Kullanıcıya özel raporlama ve grafikler
- Çevrimdışı çalışma desteği

---

## 📊 Raporlama
- Günlük toplam odaklanma süresi
- Tüm zamanların toplam odaklanma süresi
- Toplam dikkat dağınıklığı sayısı
- Son 7 gün için çubuk grafik
- Kategori bazlı pasta grafik

---

## 🚀 Kurulum ve Çalıştırma

```bash
git clone https://github.com/rvydadlra/mobile-application.git
cd mobile-application
npm install
npx expo start
