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
        if (imageFiles.length === 0) throw new Error("برجاء اختيار صورة");
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

  // مساعد للحصول على أول رابط صورة فقط لعرضه في الجدول
  const getFirstImage = (urlField) => {
    if (!urlField) return "https://via.placeholder.com/50";
    return urlField.split(",")[0].trim();
  };

  // مساعد لمعرفة عدد الصور المرفوعة
  const countImages = (urlField) => {
    if (!urlField) return 0;
    return urlField.split(",").length;
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }} dir="rtl">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2>إدارة المنتجات</h2>
        <button onClick={() => openModal()} style={{ padding: "10px 20px", cursor: "pointer" }}>+ إضافة منتج</button>
      </div>

      {loading ? (
        <div>جاري التحميل...</div>
      ) : (
        <table width="100%" border="1" cellPadding="10" style={{ borderCollapse: "collapse", textAlign: "right" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th>صورة المنتج</th>
              <th>اسم المنتج</th>
              <th>القسم</th>
              <th>السعر</th>
              <th>المخزن</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <img src={getFirstImage(p.imageUrl)} alt="" width="50" height="50" style={{ objectCover: "cover" }} />
                  {countImages(p.imageUrl) > 1 && <span style={{ fontSize: "10px", block: "true" }}>+{countImages(p.imageUrl) - 1} صور</span>}
                </td>
                <td>{p.nameAr}</td>
                <td>{p.category}</td>
                <td>{p.price} ج.م</td>
                <td>{p.stock}</td>
                <td>
                  <button onClick={() => openModal(p)}>تعديل</button>
                  <button onClick={() => { if(confirm("حذف؟")) deleteProduct(p.id, p.imagePath) }}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div style={{ fixed: "true", position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", itemsCenter: "center", justifyContent: "center", zIndex: 1000, alignItems: "center" }}>
          <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "10px", maxWidth: "500px", width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
            <h3>{editId ? "تعديل المنتج" : "إضافة منتج جديد"}</h3>
            {error && <p style={{ color: "red" }}>{error}</p>}
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input type="text" name="nameAr" placeholder="الاسم بالعربي" value={formData.nameAr} onChange={handleChange} required />
              <input type="text" name="nameEn" placeholder="الاسم بالإنجليزي" value={formData.nameEn} onChange={handleChange} required />
              <textarea name="descAr" placeholder="الوصف بالعربي" value={formData.descAr} onChange={handleChange} required />
              <textarea name="descEn" placeholder="الوصف بالإنجليزي" value={formData.descEn} onChange={handleChange} required />
              <input type="number" name="price" placeholder="السعر" value={formData.price} onChange={handleChange} required />
              <input type="number" name="stock" placeholder="الكمية في المخزن" value={formData.stock} onChange={handleChange} required />
              
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="scented">شموع معطرة</option>
                <option value="decorative">شموع ديكورية</option>
                <option value="gifts">هدايا</option>
                <option value="body">مرطبات الجسم</option>
              </select>

              <label><b>اختر صور المنتج (عدد لا نهائي):</b></label>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} />

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="submit" disabled={actionLoading}>{actionLoading ? "جاري الحفظ..." : "حفظ"}</button>
                <button type="button" onClick={() => setShowModal(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;