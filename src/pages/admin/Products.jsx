import React, { useState, useEffect } from "react";
import { useLang } from "../../context/LangContext";
import { 
  subscribeToProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  uploadProductImage,
  deleteProductImage
} from "../../firebase/products";

const AdminProducts = () => {
  const { t, isRTL } = useLang();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    nameAr: "", nameEn: "", descAr: "", descEn: "", price: "", stock: "", category: "scented", isNew: false, isBestSeller: false
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [currentImagePath, setCurrentImagePath] = useState("");

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const openModal = (product = null) => {
    setError("");
    setImageFile(null);
    setPreview("");
    if (product) {
      setEditId(product.id);
      setFormData({
        nameAr: product.nameAr || "", nameEn: product.nameEn || "",
        descAr: product.descAr || "", descEn: product.descEn || "",
        price: product.price || "", stock: product.stock || "",
        category: product.category || "scented", isNew: product.isNew || false, isBestSeller: product.isBestSeller || false
      });
      setCurrentImageUrl(product.imageUrl || "");
      setCurrentImagePath(product.imagePath || "");
    } else {
      setEditId(null);
      setFormData({ nameAr: "", nameEn: "", descAr: "", descEn: "", price: "", stock: "", category: "scented", isNew: false, isBestSeller: false });
      setCurrentImageUrl("");
      setCurrentImagePath("");
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");

    try {
      const productData = {
        nameAr: formData.nameAr, nameEn: formData.nameEn,
        descAr: formData.descAr, descEn: formData.descEn,
        price: Number(formData.price), stock: Number(formData.stock),
        category: formData.category, isNew: formData.isNew, isBestSeller: formData.isBestSeller,
      };

      if (editId) {
        let finalUrl = currentImageUrl;
        let finalPath = currentImagePath;

        if (imageFile) {
          if (currentImagePath) await deleteProductImage(currentImagePath);
          const uploaded = await uploadProductImage(imageFile, editId);
          finalUrl = uploaded.url;
          finalPath = uploaded.path;
        }

        await updateProduct(editId, { ...productData, imageUrl: finalUrl, imagePath: finalPath });
      } else {
        if (!imageFile) throw new Error("برجاء اختيار صورة للمنتج");
        const docRef = await addProduct({ ...productData, imageUrl: "", imagePath: "" });
        const uploaded = await uploadProductImage(imageFile, docRef.id);
        await updateProduct(docRef.id, { imageUrl: uploaded.url, imagePath: uploaded.path });
      }
      setShowModal(false);
    } catch (err) {
      setError(err.message || t.error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial, sans-serif", backgroundColor: "#FAF7F2", minHeight: "100vh", color: "#3D2B1F" }} dir="rtl">
      
      {/* الهيدر الثابت */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "2px solid #E8DDD0", paddingBottom: "15px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "26px()", color: "#3D2B1F" }}>إدارة المنتجات</h2>
          <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#8B7355" }}>لوحة تحكم مخزن متجر ليمو</p>
        </div>
        <button onClick={() => openModal()} style={{ padding: "10px 20px", backgroundColor: "#3D2B1F", color: "white", border: "none", borderRadius: "20px", cursor: "pointer", fontWeight: "bold" }}>
          + إضافة منتج جديد
        </button>
      </div>

      {/* الجدول المستقل تماماً عن التايلويند */}
      {loading ? (
        <div style={{ padding: "20px", textAlign: "center" }}>جاري تحميل المخزن...</div>
      ) : (
        <div style={{ backgroundColor: "white", borderRadius: "10px", border: "1px solid #E8DDD0", overflowX: "auto" }}>
          <table width="100%" cellPadding="12" style={{ borderCollapse: "collapse", textAlign: "right" }}>
            <thead>
              <tr style={{ backgroundColor: "#FAF7F2", borderBottom: "1px solid #E8DDD0", color: "#8B7355" }}>
                <th style={{ width: "80px", textAlign: "center" }}>الصورة</th>
                <th>اسم المنتج</th>
                <th>القسم</th>
                <th>السعر</th>
                <th>المخزن</th>
                <th style={{ width: "120px", textAlign: "center" }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #FAF7F2" }}>
                  <td style={{ textAlign: "center" }}>
                    <img src={p.imageUrl || "https://via.placeholder.com/50"} alt="" width="50" height="50" style={{ objectFit: "cover", borderRadius: "8px", border: "1px solid #E8DDD0" }} />
                  </td>
                  <td style={{ fontWeight: "bold" }}>{p.nameAr}</td>
                  <td style={{ color: "#8B7355" }}>{p.category}</td>
                  <td style={{ color: "#3D2B1F", fontWeight: "bold" }}>{p.price} ج.م</td>
                  <td>{p.stock} قطعة</td>
                  <td style={{ textAlign: "center" }}>
                    <button onClick={() => openModal(p)} style={{ background: "none", border: "none", color: "#C9A96E", cursor: "pointer", fontWeight: "bold", marginLeft: "8px" }}>تعديل</button>
                    <button onClick={() => { if(confirm("حذف المنتج؟")) deleteProduct(p.id, p.imagePath) }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: "bold" }}>حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* المودال المنبثق المحمي ذو التنسيق الثابت */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "15px", maxWidth: "480px", width: "90%", maxHeight: "85vh", overflowY: "auto", border: "1px solid #E8DDD0" }}>
            <h3 style={{ marginTop: 0, borderBottom: "1px solid #E8DDD0", paddingBottom: "10px", color: "#3D2B1F" }}>{editId ? "تعديل المنتج" : "إضافة منتج جديد"}</h3>
            {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input type="text" name="nameAr" placeholder="الاسم بالعربي" value={formData.nameAr} onChange={handleChange} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #E8DDD0", boxSizing: "border-box" }} required />
              <input type="text" name="nameEn" placeholder="الاسم بالإنجليزي" value={formData.nameEn} onChange={handleChange} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #E8DDD0", boxSizing: "border-box" }} required />
              <textarea name="descAr" placeholder="الوصف بالعربي" value={formData.descAr} onChange={handleChange} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #E8DDD0", boxSizing: "border-box", resize: "none" }} required />
              <textarea name="descEn" placeholder="الوصف بالإنجليزي" value={formData.descEn} onChange={handleChange} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #E8DDD0", boxSizing: "border-box", resize: "none" }} required />
              
              <div style={{ display: "flex", gap: "10px" }}>
                <input type="number" name="price" placeholder="السعر" value={formData.price} onChange={handleChange} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E8DDD0", boxSizing: "border-box" }} required />
                <input type="number" name="stock" placeholder="المخزن" value={formData.stock} onChange={handleChange} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E8DDD0", boxSizing: "border-box" }} required />
                <select name="category" value={formData.category} onChange={handleChange} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E8DDD0", backgroundColor: "white" }}>
                  <option value="scented">شموع معطرة</option>
                  <option value="decorative">شموع ديكورية</option>
                  <option value="gifts">هدايا</option>
                  <option value="body">مرطبات الجسم</option>
                </select>
              </div>

              <label style={{ fontSize: "13px", fontWeight: "bold" }}>صورة المنتج:</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              
              {preview && <img src={preview} alt="" width="60" height="60" style={{ objectFit: "cover", borderRadius: "5px" }} />}
              {!preview && currentImageUrl && <img src={currentImageUrl} alt="" width="60" height="60" style={{ objectFit: "cover", borderRadius: "5px" }} />}

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <label style={{ fontSize: "13px", cursor: "pointer" }}><input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleChange} /> جديد</label>
                <label style={{ fontSize: "13px", cursor: "pointer" }}><input type="checkbox" name="isBestSeller" checked={formData.isBestSeller} onChange={handleChange} /> الأكثر مبيعاً</label>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", borderTop: "1px solid #E8DDD0", paddingTop: "15px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "8px 16px", borderRadius: "15px", border: "1px solid #E8DDD0", backgroundColor: "#FAF7F2", cursor: "pointer" }}>إلغاء</button>
                <button type="submit" style={{ padding: "8px 20px", borderRadius: "15px", border: "none", backgroundColor: "#3D2B1F", color: "white", fontWeight: "bold", cursor: "pointer" }} disabled={actionLoading}>
                  {actionLoading ? "جاري الحفظ..." : "حفظ المنتج"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;