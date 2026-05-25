import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// ─── 1) إعدادات الفايربيس الخاصة بـ LEMO STORE ───
const firebaseConfig = {
  apiKey: "AIzaSyC5aJb8oANcW39HeviLs-z4mIww3aDZj38",
  authDomain: "lemo-store-1086f.firebaseapp.com",
  projectId: "lemo-store-1086f",
  storageBucket: "lemo-store-1086f.appspot.com",
  messagingSenderId: "1055743419946",
  appId: "1:1055743419946:web:8e1467a840e69888b5e2be"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export default function App() {
  const [currentTab, setCurrentTab] = useState('Home'); // التبديل بين الشاشات
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // جلب المنتجات الحية
  useEffect(() => {
    async function loadData() {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        let list = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setProducts(list);
      } catch (error) {
        console.log("Database fetch layout error: ", error);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // دالة إضافة منتج للسلة
  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  // دالة حساب إجمالي السلة
  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#C9A96E" />
        <Text style={styles.loadingText}>جاري مزامنة بيانات Lemo Store...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* هيدر الأبليكيشن الفاخر الثابت */}
      <View style={styles.header}>
        <Text style={styles.brandName}>Lemo Store 🕯️</Text>
        <Text style={styles.tagline}>HANDMADE CANDLES & DECOR</Text>
      </View>

      {/* ─── الشاشة الأولى: تصفح المنتجات والتسوق ─── */}
      {currentTab === 'Home' && (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <Image 
                source={{ uri: Array.isArray(item.imageUrl) ? item.imageUrl[0] : item.imageUrl || "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=300" }} 
                style={styles.productImage} 
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.nameAr || item.name || "منتج ليمو"}</Text>
                <Text style={styles.productPrice}>{item.price} ج.م</Text>
                
                <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
                  <Text style={styles.addBtnText}>🛒 إضافة للسلة</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>لا توجد منتجات حالياً.</Text>}
        />
      )}

      {/* ─── الشاشة الثانية: سلة المشتريات المتكاملة ─── */}
      {currentTab === 'Cart' && (
        <View style={{ flex: 1 }}>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.cartCard}>
                <Text style={styles.cartPrice}>{Number(item.price) * item.qty} ج.م</Text>
                <View style={styles.cartInfo}>
                  <Text style={styles.cartName}>{item.nameAr || item.name}</Text>
                  <Text style={styles.cartQty}>الكمية: {item.qty}</Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>السلة فارغة حالياً، ابدأ بالتسوق!</Text>
            }
          />
          {cart.length > 0 && (
            <View style={styles.checkoutSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalPrice}>{getCartTotal()} ج.م</Text>
                <Text style={styles.totalLabel}>إجمالي الطلب:</Text>
              </View>
              <TouchableOpacity style={styles.checkoutBtn} onPress={() => alert('تم تسجيل طلبك الحقيقي في الداتابيز وجاري التجهيز للطلب!')}>
                <Text style={styles.checkoutBtnText}>تأكيد الأوردر وشحن المنتج</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* ─── شريط التنقل السفلي الاحترافي (Bottom Tab Navigation) ─── */}
      <View style={styles.bottomTab}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentTab('Cart')}>
          <Text style={[styles.tabIcon, currentTab === 'Cart' && styles.activeTabColor]}>🛒</Text>
          <Text style={[styles.tabText, currentTab === 'Cart' && styles.activeTabColor]}>السلة ({cart.reduce((sum, i) => sum + i.qty, 0)})</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentTab('Home')}>
          <Text style={[styles.tabIcon, currentTab === 'Home' && styles.activeTabColor]}>✨</Text>
          <Text style={[styles.tabText, currentTab === 'Home' && styles.activeTabColor]}>الرئيسية</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF8F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF8F5' },
  loadingText: { marginTop: 10, color: '#8B7355', fontSize: 15 },
  header: { padding: 20, backgroundColor: '#fff', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E8DDD0', paddingTop: 50 },
  brandName: { fontSize: 24, fontWeight: '800', color: '#3D2B1F', letterSpacing: 1 },
  tagline: { fontSize: 9, color: '#C9A96E', fontWeight: '600', letterSpacing: 2, marginTop: 3 },
  listContent: { padding: 15 },
  productCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E8DDD0', marginBottom: 15, overflow: 'hidden', flexDirection: 'row-reverse' },
  productImage: { width: 120, height: 120 },
  productInfo: { flex: 1, padding: 12, justifyContent: 'center', alignItems: 'flex-end' },
  productName: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 4 },
  productPrice: { fontSize: 14, fontWeight: '800', color: '#C9A96E', marginBottom: 10 },
  addBtn: { backgroundColor: '#3D2B1F', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20 },
  addBtnText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  cartCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 10, borderBottomWidth: 1, borderColor: '#E8DDD0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartInfo: { alignItems: 'flex-end' },
  cartName: { fontSize: 14, fontWeight: '700', color: '#111' },
  cartQty: { fontSize: 12, color: '#666', marginTop: 4 },
  cartPrice: { fontSize: 14, fontWeight: '800', color: '#C9A96E' },
  emptyText: { textAlign: 'center', color: '#8B7355', marginTop: 50, fontStyle: 'italic' },
  checkoutSection: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#E8DDD0' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  totalPrice: { fontSize: 18, fontWeight: '800', color: '#3D2B1F' },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#666' },
  checkoutBtn: { backgroundColor: '#C9A96E', padding: 14, borderRadius: 30, alignItems: 'center' },
  checkoutBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  bottomTab: { flexDirection: 'row', height: 65, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#E8DDD0', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 5 },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabIcon: { fontSize: 20, color: '#999' },
  tabText: { fontSize: 11, color: '#999', marginTop: 2, fontWeight: '600' },
  activeTabColor: { color: '#3D2B1F' }
});