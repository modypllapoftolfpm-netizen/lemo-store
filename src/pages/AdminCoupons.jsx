import { useState, useEffect } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import Navbar from "../components/layout/Navbar";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("");
  const [type, setType] = useState("global"); // global, product, category
  const [targetId, setTargetId] = useState("");

  // جلب الكوبونات من الفايربيس
  useEffect(() => {
    const q = query(collection(db, "coupons"), orderBy("code", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // إضافة كوبون جديد
  const handleAdd = async () => {
    if (!newCode || !newDiscount) return alert("الرجاء إدخال الكود ونسبة الخصم");
    
    await addDoc(collection(db, "coupons"), {
      code: newCode.toUpperCase(),
      discount: Number(newDiscount),
      type: type,
      targetId: targetId,
      active: true
    });
    
    setNewCode(""); 
    setNewDiscount(""); 
    setTargetId("");
    alert("تم إضافة الكوبون بنجاح!");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", padding: "2rem", fontFamily: "Cairo" }} dir="rtl">
      <Navbar />
      <div style={{ maxWidth: "800px", margin: "2rem auto", background: "#fff", padding: "2rem", borderRadius: "15px" }}>
        <h2 style={{ color: "#3D2B1F" }}>إدارة الكوبونات (لوحة الأدمن)</h2>
        
        {/* فورمة الإضافة */}
        <div style={{ background: "#f4f4f4", padding: "1.5rem", borderRadius: "10px", marginBottom: "2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <input placeholder="كود الكوبون (مثال: LEMO20)" value={newCode} onChange={(e) => setNewCode(e.target.value)} style={{ padding: "10px" }} />
            <input type="number" placeholder="نسبة الخصم %" value={newDiscount} onChange={(e) => setNewDiscount(e.target.value)} style={{ padding: "10px" }} />
            
            <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: "10px" }}>
                <option value="global">خصم على الكل (Global)</option>
                <option value="product">خصم على منتج محدد</option>
                <option value="category">خصم على فئة محددة</option>
            </select>
            
            {(type === "product" || type === "category") && (
                <input placeholder="ID المنتج أو الفئة" value={targetId} onChange={(e) => setTargetId(e.target.value)} style={{ padding: "10px" }} />
            )}
          </div>
          <button onClick={handleAdd} style={{ marginTop: "1rem", width: "100%", padding: "10px", background: "#3D2B1F", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            إضافة كوبون جديد
          </button>
        </div>

        {/* قائمة الكوبونات */}
        <h3>الكوبونات الحالية:</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {coupons.map(c => (
            <li key={c.id} style={{ background: "#fff", padding: "10px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}>
              <span><strong>{c.code}</strong> - {c.discount}% ({c.type})</span>
              <button onClick={() => deleteDoc(doc(db, "coupons", c.id))} style={{ background: "#ffcccc", border: "none", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }}>حذف</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}