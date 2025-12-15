import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { getTodayTotal, getAllTimeTotal, getTotalDistractions, getLast7Days, getCategoryTotals } from '../database/database';
import { AuthContext } from '../context/AuthContext';

export default function ReportsScreen() {
  const { user } = useContext(AuthContext);
  const userId = user?.id;
  const [todayTotal, setTodayTotal] = useState(0);
  const [allTimeTotal, setAllTimeTotal] = useState(0);
  const [totalDistractions, setTotalDistractions] = useState(0);
  const [last7DaysData, setLast7DaysData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  // Saniyeyi dakika:saniye formatına çevir
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Her 5 saniyede bir güncelle
    return () => clearInterval(interval);
  }, [userId]);

  const loadData = () => {
    if (!userId) {
      setTodayTotal(0);
      setAllTimeTotal(0);
      setTotalDistractions(0);
      setLast7DaysData([]);
      setCategoryData([]);
      return;
    }
    setTodayTotal(getTodayTotal(userId));
    setAllTimeTotal(getAllTimeTotal(userId));
    setTotalDistractions(getTotalDistractions(userId));
    setLast7DaysData(getLast7Days(userId));
    setCategoryData(getCategoryTotals(userId));
  };

  // Son 7 gün için grafik verisi hazırla (saniye cinsinden)
  const prepareBarChartData = () => {
    const labels = [];
    const data = [];
    const last7 = last7DaysData.slice(-7);

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = last7.find(d => d.date === dateStr);
      
      labels.push(date.toLocaleDateString('tr-TR', { weekday: 'short' }));
      // Değerleri saniye olarak kullan
      data.push(dayData ? dayData.total : 0);
    }

    return { labels, datasets: [{ data: data.length ? data : [0] }] };
  };

  // Kategori pasta grafiği verisi hazırla
  const preparePieChartData = () => {
    const colors = ['#1E88E5', '#E53935', '#FF9800', '#2ECC71', '#9B59B6'];
    const total = categoryData.reduce((sum, item) => sum + item.total, 0);
    return categoryData.map((item, index) => {
      const percentage = total > 0 ? ((item.total / total) * 100).toFixed(1) : 0;
      return {
        name: `${percentage}%`,
        population: item.total,
        color: colors[index % colors.length],
        legendFontColor: '#eaeef2',
        legendFontSize: 12,
      };
    });
  };

  const screenWidth = Dimensions.get('window').width;

  if (!userId) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={styles.title}>Önce giriş yapınız</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Raporlar</Text>

      {/* Genel İstatistikler */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Bugün Toplam</Text>
          <Text style={styles.statValue}>{formatDuration(todayTotal)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Tüm Zamanlar</Text>
          <Text style={styles.statValue}>{formatDuration(allTimeTotal)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Dikkat Dağınıklığı</Text>
          <Text style={styles.statValue}>{totalDistractions}</Text>
        </View>
      </View>

      {/* Son 7 Gün Çubuk Grafik */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Son 7 Günün Odaklanma Süresi</Text>
        {last7DaysData.length > 0 ? (
          <BarChart
            data={prepareBarChartData()}
            width={screenWidth - 56}
            height={220}
            yAxisSuffix=" sn"
            chartConfig={{
              backgroundColor: '#121821',
              backgroundGradientFrom: '#121821',
              backgroundGradientTo: '#1f2a37',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(30, 136, 229, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(234, 238, 242, ${opacity})`,
              style: { borderRadius: 16 },
              barPercentage: 0.7,
            }}
            style={styles.chart}
          />
        ) : (
          <Text style={styles.noData}>Henüz veri yok</Text>
        )}
      </View>

      {/* Kategorilere Göre Pasta Grafik */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Kategorilere Göre Dağılım</Text>
        {categoryData.length > 0 ? (
          <PieChart
            data={preparePieChartData()}
            width={screenWidth - 40}
            height={240}
            chartConfig={{
              color: (opacity = 1) => `rgba(234, 238, 242, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="8"
            absolute
            style={styles.chart}
          />
        ) : (
          <Text style={styles.noData}>Henüz veri yok</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#0f1419' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 20, color: '#eaeef2', textAlign: 'center' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 },
  statBox: { backgroundColor: '#121821', padding: 18, borderRadius: 16, alignItems: 'center', flex: 1, marginHorizontal: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 10, borderWidth: 1, borderColor: '#1f2a37' },
  statLabel: { fontSize: 12, color: '#97a6b2', marginBottom: 6 },
  statValue: { fontSize: 24, fontWeight: '800', color: '#eaeef2' },
  chartContainer: { backgroundColor: '#121821', padding: 8, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#1f2a37', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  chartTitle: { fontSize: 19, fontWeight: '800', marginBottom: 16, color: '#eaeef2' },
  chart: { marginVertical: 8, borderRadius: 16 },
  noData: { textAlign: 'center', color: '#97a6b2', fontSize: 16, marginVertical: 20 },
});
