# Odaklanma Takibi ve Raporlama Uygulaması

React Native (Expo) tabanlı bu uygulama, odaklanma seanslarını başlatma, AppState ile dikkat dağınıklığını yakalama ve sonuçları raporlama için hazırlandı.

## Özellikler
- 25 dk varsayılan (metin kutusu ile değiştirilebilir) geri sayım sayacı
- Başlat / Duraklat / Sıfırla kontrolleri
- Kategori seçimi (Ders, Kodlama, Proje, Kitap)
- AppState ile arka plana geçince otomatik duraklatma ve dikkat dağınıklığı sayacı
- Seans özeti kaydı (süre, kategori, dikkat dağınıklığı) ve son seansı gösterme
- Raporlar sekmesinde genel istatistikler, son 7 gün çubuk grafik, kategori bazlı pasta grafik
- Veriler AsyncStorage ile cihazda saklanır

## Kurulum
```bash
npm install
```

## Çalıştırma
```bash
npm start
```
Komut çıktısındaki yönlendirmelerle Expo Go veya emulator üzerinde açabilirsiniz.

## Görevler
- `npm run lint`: ESLint kontrolü (Prettier uyarıları kapalı).
- VS Code görev listesinde `expo start` görevi hazır.

## Notlar
- Web çıkışı için `expo start --web` kullanabilirsiniz; Router gerektirmemesi için web output statik değil.
- Grafikler için `react-native-chart-kit` ve `react-native-svg` kullanılıyor.
- AsyncStorage verilerini temizlemek için cihaz ayarlarından uygulama verisini silmeniz yeterli.
