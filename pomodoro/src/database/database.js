import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('pomodoro.db');

// Veritabanı tablolarını oluştur
export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      duration INTEGER NOT NULL,
      distractions INTEGER NOT NULL,
      user_id INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  // Eski tabloda user_id kolonu yoksa ekle
  try {
    const hasUserId = db.getAllSync("PRAGMA table_info(sessions)").some(col => col.name === 'user_id');
    if (!hasUserId) {
      db.execSync('ALTER TABLE sessions ADD COLUMN user_id INTEGER');
    }
  } catch (e) {
    // No-op: kolon zaten varsa veya eklenemiyorsa sessizce devam et
  }
};

// Kullanıcı kayıt
export const registerUser = (username, password) => {
  const existing = db.getFirstSync('SELECT id FROM users WHERE username = ?', [username]);
  if (existing) {
    return { success: false, error: 'USERNAME_TAKEN' };
  }
  db.runSync('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
  const user = db.getFirstSync('SELECT id, username FROM users WHERE username = ?', [username]);
  return { success: true, user };
};

// Kullanıcı giriş
export const loginUser = (username, password) => {
  const user = db.getFirstSync('SELECT id, username FROM users WHERE username = ? AND password = ?', [username, password]);
  if (!user) return { success: false };
  return { success: true, user };
};

// Seans kaydet (duration saniye cinsinden)
export const saveSession = (category, durationSeconds, distractions, userId) => {
  if (!userId) return;
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  db.runSync(
    'INSERT INTO sessions (date, category, duration, distractions, user_id) VALUES (?, ?, ?, ?, ?)',
    [date, category, durationSeconds, distractions, userId]
  );
};

// Tüm seansları getir
export const getAllSessions = (userId) => {
  if (!userId) return [];
  const result = db.getAllSync('SELECT * FROM sessions WHERE user_id = ? ORDER BY date DESC', [userId]);
  return result;
};

// Veritabanını temizle (yalnızca ilgili kullanıcı)
export const clearAllSessions = (userId) => {
  if (!userId) return;
  db.runSync('DELETE FROM sessions WHERE user_id = ?', [userId]);
};

// Bugünün toplam odaklanma süresi
export const getTodayTotal = (userId) => {
  if (!userId) return 0;
  const today = new Date().toISOString().split('T')[0];
  const result = db.getFirstSync(
    'SELECT SUM(duration) as total FROM sessions WHERE date = ? AND user_id = ?',
    [today, userId]
  );
  return result?.total || 0;
};

// Tüm zamanların toplam odaklanma süresi
export const getAllTimeTotal = (userId) => {
  if (!userId) return 0;
  const result = db.getFirstSync('SELECT SUM(duration) as total FROM sessions WHERE user_id = ?', [userId]);
  return result?.total || 0;
};

// Toplam dikkat dağınıklığı sayısı
export const getTotalDistractions = (userId) => {
  if (!userId) return 0;
  const result = db.getFirstSync('SELECT SUM(distractions) as total FROM sessions WHERE user_id = ?', [userId]);
  return result?.total || 0;
};

// Son 7 günün verileri
export const getLast7Days = (userId) => {
  if (!userId) return [];
  const result = db.getAllSync(`
    SELECT date, SUM(duration) as total
    FROM sessions
    WHERE date >= date('now', '-7 days') AND user_id = ?
    GROUP BY date
    ORDER BY date ASC
  `, [userId]);
  return result;
};

// Kategorilere göre toplam süreler
export const getCategoryTotals = (userId) => {
  if (!userId) return [];
  const result = db.getAllSync(`
    SELECT category, SUM(duration) as total
    FROM sessions
    WHERE user_id = ?
    GROUP BY category
  `, [userId]);
  return result;
};
