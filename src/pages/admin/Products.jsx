import React, { useState, useEffect } from "react";
import { useLang } from "../../context/LangContext";
import { 
  subscribeToProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  uploadProductImages, 
  deleteProductImages 
} from "../../firebase/products";

const AdminProducts = () => {
  const { t, isRTL } = useLang();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // ─── State الفورم ──────────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    nameAr: "", nameEn: "",
    descAr: "", descEn: "",
    price: "", stock: "",
    category: "scented",
    isNew: false, isBestSeller: false
  });

  // تخزين ملفات الصور المختارة والمعاينة
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // للصور القديمة في حالة التعديل

  // ─── جلب المنتجات في الوقت الفعلي ──────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  // ─── التعامل مع اختيار الصور المتعددة ───────────────────────────────────────
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // إضافة الملفات الجديدة للـ State
    setImageFiles((prev) => [...prev, ...files]);

    // توليد روابط للمعاينة فوراً قبل الرفع
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  // إزالة صورة من قائمة المعاينة قبل الرفع
  const removePreview = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // إزالة صورة مرفوعة بالفعل من الـ Database (عند التعديل)
  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ─── فتح المودال للإضافة أو التعديل ─────────────────────────────────────────
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
        category: product.category || "scented",
        isNew: product.isNew || false, isBestSeller: product.isBestSeller || false
      });
      setExistingImages(product.images || []); // تحميل الصور القديمة إن وجدت
    } else {
      setEditId(null);
      setFormData({
        nameAr: "", nameEn: "",
        descAr: "", descEn: "",
        price: "", stock: "",
        category: "scented",
        isNew: false, isBestSeller: false
      });
      setExistingImages([]);
    }
    setShowModal(true);
  };

  // ─── دالة حفظ وإرسال البيانات لحساب Firebase ──────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");

    try {
      const productData = {
        nameAr: formData.nameAr,
        nameEn: formData.nameEn,
        descAr: formData.descAr,
        descEn: formData.descEn,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category,
        isNew: formData.isNew,
        isBestSeller: formData.isBestSeller,
      };

      if (editId) {
        // أ) حالة التعديل على منتج موجود
        let updatedImages = [...existingImages];

        // لو الأدمن اختار صور جديدة يرفعها ويزودها على المصفوفة
        if (imageFiles.length > 0) {
          const newUploaded = await uploadProductImages(imageFiles, editId);
          updatedImages = [...updatedImages, ...newUploaded];
        }

        await updateProduct(editId, { ...productData, images: updatedImages });
      } else {
        // ب) حالة إضافة منتج جديد تماماً
        if (imageFiles.length === 0) {
          throw new Error(isRTL ? "برجاء اختيار صورة واحدة على الأقل للمنتج" : "Please select at least one image");
        }

        // 1. نعمل المنتج الأول بدون صور لنحصل على الـ ID
        const docRef = await addProduct({ ...productData, images: [] });
        
        // 2. نرفع الصور اللانهائية داخل مجلد الـ ID الخاص بالمنتج
        const uploadedImages = await uploadProductImages(imageFiles, docRef.id);
        
        // 3. نحدث المنتج بمصفوفة الصور الكاملة
        await updateProduct(docRef.id, { images: uploadedImages });
      }

      setShowModal(false);
    } catch (err) {
      console.error(err);
      setError(err.message || t.error);
    } finally {
      setActionLoading(false);
    }
  };

  // ─── دالة الحذف الكامل للمنتج وصوره ────────────────────────────────────────
  const handleDelete = async (product) => {
    if (window.confirm(t.admin.deleteConfirm)) {
      try {
        await deleteProduct(product.id, product.images || []);
      } catch (err) {
        console.error(err);
        alert(t.error);
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fadeUp">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-lemo-dark">{t.admin.products}</h1>
        <button onClick={() => openModal()} className="btn-primary py-2 px-6 text-sm">
          + {t.admin.addProduct}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-lemo-muted">{t.loading}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-lemo-beige/30 overflow-hidden shadow-sm">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-lemo-cream border-b border-lemo-beige/40 text-sm text-lemo-muted">
                <th className="p-4">{t.admin.image}</th>
                <th className="p-4">{t.admin.productName}</th>
                <th className="p-4">{t.admin.category}</th>
                <th className="p-4">{t.admin.price}</th>
                <th className="p-4">{t.admin.stock}</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="text-sm text-lemo-dark divide-y divide-lemo-cream">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-lemo-cream/30 transition-colors">
                  <td className="p-4">
                    <img 
                      src={p.images && p.images[0] ? p.images[0].url : "https://via.placeholder.com/50"} 
                      alt={p.nameAr} 
                      className="w-12 h-12 object-cover rounded-xl border border-lemo-beige/30"
                    />
                    {p.images && p.images.length > 1 && (
                      <span className="text-[10px] text-lemo-muted block mt-1">+{p.images.length - 1} صور أخرى</span>
                    )}
                  </td>
                  <td className="p-4 font-medium">{isRTL ? p.nameAr : p.nameEn}</td>
                  <td className="p-4 text-lemo-muted">{t.categories[p.category] || p.category}</td>
                  <td className="p-4 font-bold">{p.price} {t.currency}</td>
                  <td className="p-4">{p.stock}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => openModal(p)} className="text-blue-600 hover:underline mx-2">{t.edit}</button>
                    <button onClick={() => handleDelete(p)} className="text-red-600 hover:underline mx-2">{t.delete}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── نافذة (Modal) إضافة وتعديل المنتج ───────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-xl border border-lemo-beige/20 animate-fadeUp">
            <h2 className="text-xl font-bold text-lemo-dark border-b pb-3 mb-4">
              {editId ? t.edit : t.admin.addProduct}
            </h2>

            {error && <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-lemo-muted mb-1">{t.admin.productNameAr} *</label>
                  <input type="text" name="nameAr" value={formData.nameAr} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-lemo-muted mb-1">{t.admin.productNameEn} *</label>
                  <input type="text" name="nameEn" value={formData.nameEn} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border text-sm" required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-lemo-muted mb-1">{t.admin.descAr} *</label>
                  <textarea name="descAr" value={formData.descAr} onChange={handleChange} rows="2" className="w-full px-4 py-2.5 rounded-xl border text-sm resize-none" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-lemo-muted mb-1">{t.admin.descEn} *</label>
                  <textarea name="descEn" value={formData.descEn} onChange={handleChange} rows="2" className="w-full px-4 py-2.5 rounded-xl border text-sm resize-none" required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-lemo-muted mb-1">{t.admin.price} *</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-lemo-muted mb-1">{t.admin.stock} *</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-lemo-muted mb-1">{t.admin.category} *</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border text-sm bg-white">
                    <option value="scented">{t.categories.scented}</option>
                    <option value="decorative">{t.categories.decorative}</option>
                    <option value="gifts">{t.categories.gifts}</option>
                    <option value="body">{t.categories.body}</option>
                  </select>
                </div>
              </div>

              {/* ─── رفع الصور المتعددة اللانهائية ─── */}
              <div className="border-t border-dashed border-lemo-beige/60 pt-4">
                <label className="block text-xs font-bold text-lemo-dark mb-2">إلبوم صور المنتج (يمكنك اختيار عدد لا نهائي من الصور) *</label>
                
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-lemo-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-lemo-cream file:text-lemo-muted hover:file:bg-lemo-beige/50 cursor-pointer"
                />

                {/* عرض الصور القديمة في حالة التعديل */}
                {existingImages.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[11px] text-lemo-muted mb-1.5">الصور الحالية المرفوعة على الموقع:</p>
                    <div className="flex flex-wrap gap-2">
                      {existingImages.map((img, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-lemo-beige">
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-0 right-0 bg-red-600 text-white rounded-bl-lg p-0.5 text-[10px] w-4 h-4 flex items-center justify-center hover:bg-red-700">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* عرض معاينة الصور الجديدة المحددة قبل الرفع */}
                {previews.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[11px] text-green-600 mb-1.5">صور جديدة مضافة (سيتم رفعها عند الضغط على حفظ):</p>
                    <div className="flex flex-wrap gap-2">
                      {previews.map((url, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-green-200">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removePreview(idx)} className="absolute top-0 right-0 bg-gray-800 text-white rounded-bl-lg p-0.5 text-[10px] w-4 h-4 flex items-center justify-center hover:bg-black">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 text-xs text-lemo-dark font-medium cursor-pointer">
                  <input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleChange} className="rounded" />
                  {t.admin.isNew}
                </label>
                <label className="flex items-center gap-2 text-xs text-lemo-dark font-medium cursor-pointer">
                  <input type="checkbox" name="isBestSeller" checked={formData.isBestSeller} onChange={handleChange} className="rounded" />
                  {t.admin.isBestSeller}
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t pt-4 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 rounded-full text-xs font-medium border border-lemo-beige text-lemo-muted hover:bg-lemo-cream" disabled={actionLoading}>
                  {t.cancel}
                </button>
                <button type="submit" className="btn-primary py-2 px-6 text-xs" disabled={actionLoading}>
                  {actionLoading ? t.loading : t.save}
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