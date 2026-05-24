import React, { useState, useEffect } from "react";
import { useLang } from "../../context/LangContext";
import { 
  subscribeToProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  uploadMultipleImagesToText 
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

  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImagesText, setExistingImagesText] = useState("");

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviews(urls);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const openModal = (product = null) => {
    setError("");
    setImageFiles([]);
    setPreviews([]);
    if (product) {
      setEditId(product.id);
      setFormData({
        nameAr: product.nameAr || "", nameEn: product.nameEn || "",
        descAr: product.descAr || "", descEn: product.descEn || "",
        price: product.price || "", stock: product.stock || "",
        category: product.category || "scented", isNew: product.isNew || false, isBestSeller: product.isBestSeller || false
      });
      setExistingImagesText(product.imageUrl || "");
    } else {
      setEditId(null);
      setFormData({ nameAr: "", nameEn: "", descAr: "", descEn: "", price: "", stock: "", category: "scented", isNew: false, isBestSeller: false });
      setExistingImagesText("");
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
        let finalImageUrl = existingImagesText;
        let finalImagePath = products.find(p => p.id === editId)?.imagePath || "";

        if (imageFiles.length > 0) {
          const uploaded = await uploadMultipleImagesToText(imageFiles, editId);
          finalImageUrl = existingImagesText ? existingImagesText + "," + uploaded.imageUrl : uploaded.imageUrl;
          finalImagePath = finalImagePath ? finalImagePath + "," + uploaded.imagePath : uploaded.imagePath;
        }

        await updateProduct(editId, { ...productData, imageUrl: finalImageUrl, imagePath: finalImagePath });
      } else {
        if (imageFiles.length === 0) throw new Error("برجاء اختيار صورة واحدة على الأقل");
        const tempId = "new_" + Date.now();
        const uploaded = await uploadMultipleImagesToText(imageFiles, tempId);
        await addProduct({ ...productData, imageUrl: uploaded.imageUrl, imagePath: uploaded.imagePath });
      }
      setShowModal(false);
    } catch (err) {
      setError(err.message || t.error);
    } finally {
      setActionLoading(false);
    }
  };

  const getFirstImage = (urlField) => {
    if (!urlField) return "https://via.placeholder.com/60";
    return urlField.split(",")[0].trim();
  };

  const countImages = (urlField) => {
    if (!urlField) return 0;
    return urlField.split(",").length;
  };

  return (
    <div style={{ padding: "30px", fontFamily: "'Cairo', Arial, sans-serif", backgroundColor: "#FAF7F2", minHeight: "100 screen", color: "#3D2B1F" }} dir="rtl">
      
      {/* رأس الصفحة الافتراضي الأنيق */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "2px solid #E8DDD0", paddingBottom: "15px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "28px", color: "#3D2B1F" }}>إدارة المنتجات</h2>
          <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#8B7355" }}>أضف وتحكم في منتجات متجر ليمو وصورها اللانهائية</p>
        </div>
        <button onClick={() => openModal()} style={{ padding: "12px 24px", backgroundColor: "#3D2B1F", color: "white", border: "none", borderRadius: "25px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}>
          + إضافة منتج جديد
        </button>
      </div>

      {/* جدول عرض البيانات المستقر */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#8B7355" }}>جاري تحميل المنتجات من قاعدة البيانات...</div>
      ) : (
        <div style={{ backgroundColor: "white", borderRadius: "15px", border: "1px solid #E8DDD0", overflow: "hidden", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
          <table width="100%" cellPadding="15" style={{ borderCollapse: "collapse", textAlign: "right" }}>
            <thead>
              <tr style={{ backgroundColor: "#FAF7F2", borderBottom: "1px solid #E8DDD0", color: "#8B7355", fontSize: "14px" }}>
                <th style={{ textAlign: "center", width: "100px" }}>صورة المنتج</th>
                <th>اسم المنتج</th>
                <th>القسم</th>
                <th>السعر</th>
                <th>المخزن</th>
                <th style={{ textAlign: "center", width: "150px" }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: "15px" }}>
              {products.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #FAF7F2" }}>
                  <td style={{ textAlign: "center" }}>
                    <img src={getFirstImage(p.imageUrl)} alt="" width="55" height="55" style={{ objectFit: "cover", borderRadius: "10px", border: "1px solid #E8DDD0" }} />
                    {countImages(p.imageUrl) > 1 && (
                      <span style={{ display: "block", fontSize: "10px", color: "white", backgroundColor: "#C9A96E", borderRadius: "5px", padding: "2px 4px", marginTop: "4px", width: "fit-content", margin: "4px auto 0 auto" }}>
                        +{countImages(p.imageUrl) - 1} صور أخرى
                      </span>
                    )}
                  </td>
                  <td style={{ fontWeight: "bold", color: "#2C1810" }}>{p.nameAr}</td>
                  <td style={{ color: "#8B7355" }}>{p.category === "scented" ? "شموع معطرة" : p.category === "decorative" ? "شموع ديكورية" : p.category === "gifts" ? "هدايا" : "مرطبات الجسم"}</td>
                  <td style={{ fontWith: "bold", color: "#3D2B1F" }}>{p.price} ج.م</td>
                  <td style={{ fontStyle: "italic" }}>{p.stock} قطعة</td>
                  <td style={{ textAlign: "center" }}>
                    <button onClick={() => openModal(p)} style={{ background: "none", border: "none", color: "#C9A96E", cursor: "pointer", fontWeight: "bold", marginLeft: "10px" }}>تعديل</button>
                    <span style={{ color: "#E8DDD0" }}>|</span>
                    <button onClick={() => { if(confirm("هل أنت متأكد من حذف هذا المنتج نهائياً؟")) deleteProduct(p.id, p.imagePath) }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: "bold", marginRight: "10px" }}>حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── المودال المنبثق المحمي والجميل (ستايل مستقل تماماً) ─── */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(61, 43, 31, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "20px", maxWidth: "550px", width: "90%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", border: "1px solid #E8DDD0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E8DDD0", paddingBottom: "10px", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: "#3D2B1F", fontSize: "20px" }}>{editId ? "تعديل بيانات المنتج الحالي" : "إضافة منتج جديد للمخزن"}</h3>
              <button type="button" onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#8B7355" }}>×</button>
            </div>
            
            {error && <p style={{ color: "#ef4444", backgroundColor: "#fef2f2", padding: "10px", borderRadius: "10px", fontSize: "13px", border: "1px solid #fee2e2" }}>{error}</p>}
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#8B7355", marginBottom: "5px", fontWeight: "bold" }}>اسم المنتج بالعربي *</label>
                <input type="text" name="nameAr" value={formData.nameAr} onChange={handleChange} style={{ w: "100%", width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #E8DDD0", boxSizing: "border-box" }} required />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#8B7355", marginBottom: "5px", fontWeight: "bold" }}>اسم المنتج بالإنجليزي *</label>
                <input type="text" name="nameEn" value={formData.nameEn} onChange={handleChange} style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #E8DDD0", boxSizing: "border-box" }} required />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#8B7355", marginBottom: "5px", fontWeight: "bold" }}>الوصف بالعربي *</label>
                <textarea name="descAr" value={formData.descAr} onChange={handleChange} rows="2" style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #E8DDD0", boxSizing: "border-box", resize: "none" }} required />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#8B7355", marginBottom: "5px", fontWeight: "bold" }}>الوصف بالإنجليزي *</label>
                <textarea name="descEn" value={formData.descEn} onChange={handleChange} rows="2" style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #E8DDD0", boxSizing: "border-box", resize: "none" }} required />
              </div>
              
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "12px", color: "#8B7355", marginBottom: "5px", fontWeight: "bold" }}>السعر (ج.م) *</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #E8DDD0", boxSizing: "border-box" }} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "12px", color: "#8B7355", marginBottom: "5px", fontWeight: "bold" }}>الكمية في المخزن *</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleChange} style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #E8DDD0", boxSizing: "border-box" }} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "12px", color: "#8B7355", marginBottom: "5px", fontWeight: "bold" }}>القسم المخصص *</label>
                  <select name="category" value={formData.category} onChange={handleChange} style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #E8DDD0", boxSizing: "border-box", height: "38px", backgroundColor: "white" }}>
                    <option value="scented">شموع معطرة</option>
                    <option value="decorative">شموع ديكورية</option>
                    <option value="gifts">هدايا</option>
                    <option value="body">مرطبات الجسم</option>
                  </select>
                </div>
              </div>

              <div style={{ borderTop: "1px dashed #E8DDD0", paddingTop: "15px", marginTop: "5px" }}>
                <label style={{ display: "block", fontSize: "13px", color: "#3D2B1F", marginBottom: "8px", fontWeight: "bold" }}>ألبوم صور الشموع (اختر عدد لا نهائي من الصور) *</label>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ fontSize: "12px", color: "#8B7355" }} />
                
                {previews.length > 0 && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
                    {previews.map((url, idx) => (
                      <img key={idx} src={url} alt="" width="50" height="50" style={{ objectFit: "cover", borderRadius: "8px", border: "1px solid #C9A96E" }} />
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "15px", marginTop: "5px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                  <input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleChange} /> تمييز كجديد
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                  <input type="checkbox" name="isBestSeller" checked={formData.isBestSeller} onChange={handleChange} /> تمييز كأكثر مبيعاً
                </label>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", borderTop: "1px solid #E8DDD0", paddingTop: "15px", marginTop: "10px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "10px 20px", borderRadius: "20px", border: "1px solid #E8DDD0", backgroundColor: "#FAF7F2", color: "#8B7355", cursor: "pointer", fontSize: "13px" }} disabled={actionLoading}>إلغاء</button>
                <button type="submit" style={{ padding: "10px 25px", borderRadius: "20px", border: "none", backgroundColor: "#3D2B1F", color: "white", cursor: "pointer", fontSize: "13px", fontWeight: "bold" }} disabled={actionLoading}>
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