import React, { useState, useEffect } from "react";
import { useLang } from "../../context/LangContext";
import { 
  subscribeToProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  uploadProductImages 
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
    nameAr: "", nameEn: "",
    descAr: "", descEn: "",
    price: "", stock: "",
    category: "scented",
    isNew: false, isBestSeller: false
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

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
    if (files.length === 0) return;
    setImageFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePreview = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

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
      setExistingImages(product.images || []);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");

    try {
      const productData = {
        nameAr: formData.nameAr, nameEn: formData.nameEn,
        descAr: formData.descAr, descEn: formData.descEn,
        price: Number(formData.price), stock: Number(formData.stock),
        category: formData.category, isNew: formData.isNew,
        isBestSeller: formData.isBestSeller,
      };

      if (editId) {
        let updatedImages = [...existingImages];
        if (imageFiles.length > 0) {
          const newUploaded = await uploadProductImages(imageFiles, editId);
          updatedImages = [...updatedImages, ...newUploaded];
        }
        await updateProduct(editId, { ...productData, images: updatedImages });
      } else {
        if (imageFiles.length === 0) {
          throw new Error(isRTL ? "برجاء اختيار صورة واحدة على الأقل" : "Select at least one image");
        }
        const docRef = await addProduct({ ...productData, images: [] });
        const uploadedImages = await uploadProductImages(imageFiles, docRef.id);
        await updateProduct(docRef.id, { images: uploadedImages });
      }
      setShowModal(false);
    } catch (err) {
      setError(err.message || t.error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (product) => {
    if (window.confirm(t.admin.deleteConfirm)) {
      try {
        await deleteProduct(product.id, product.images || []);
      } catch (err) {
        alert(t.error);
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] p-4 sm:p-8" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto">
        
        {/* الهيدر العلوي */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-[#E8DDD0] pb-5">
          <div>
            <h1 className="font-display text-3xl text-[#3D2B1F] font-bold">{t.admin.products}</h1>
            <p className="text-sm text-[#8B7355] mt-1">تحكم بمنتجات متجرك وأضف ألبوم صور لانهائي لكل منتج</p>
          </div>
          <button 
            onClick={() => openModal()} 
            className="bg-[#3D2B1F] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-[#C9A96E] transition-all shadow-sm"
          >
            + {t.admin.addProduct}
          </button>
        </div>

        {/* جدول المنتجات العريض والمفروض */}
        {loading ? (
          <div className="text-center py-20 text-[#8B7355] font-medium">{t.loading}</div>
        ) : (
          <div className="w-full bg-white rounded-2xl border border-[#E8DDD0] shadow-sm overflow-x-auto">
            <table className="w-full min-w-[800px] text-right border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8DDD0] text-sm text-[#8B7355]">
                  <th className="p-4 w-24 text-center">{t.admin.image}</th>
                  <th className="p-4">{t.admin.productName}</th>
                  <th className="p-4">{t.admin.category}</th>
                  <th className="p-4">{t.admin.price}</th>
                  <th className="p-4">{t.admin.stock}</th>
                  <th className="p-4 text-center w-40">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="text-sm text-[#2C1810] divide-y divide-[#FAF7F2]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                    <td className="p-4 text-center">
                      <div className="relative w-14 h-14 mx-auto rounded-xl overflow-hidden border border-[#E8DDD0] bg-[#FAF7F2]">
                        <img 
                          src={p.images && p.images[0] ? p.images[0].url : "https://via.placeholder.com/100"} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {p.images && p.images.length > 1 && (
                        <span className="text-[10px] bg-[#E8DDD0] text-[#3D2B1F] px-1.5 py-0.5 rounded-md mt-1 inline-block">+{p.images.length - 1} صور</span>
                      )}
                    </td>
                    <td className="p-4 font-medium text-base">{isRTL ? p.nameAr : p.nameEn}</td>
                    <td className="p-4 text-[#8B7355]">{t.categories[p.category] || p.category}</td>
                    <td className="p-4 font-bold text-[#2C1810]">{p.price} {t.currency}</td>
                    <td className="p-4 font-mono">{p.stock}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => openModal(p)} className="text-[#C9A96E] hover:text-[#3D2B1F] font-medium transition-colors">{t.edit}</button>
                        <span className="text-[#E8DDD0]">|</span>
                        <button onClick={() => handleDelete(p)} className="text-red-500 hover:text-red-700 font-medium transition-colors">{t.delete}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── المودال المنبثق للإضافة والتعديل (يظهر بجمال وانسيابية في منتصف الشاشة) ─── */}
        {showModal && (
          <div className="fixed inset-0 bg-[#3D2B1F]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-xl border border-[#E8DDD0] animate-fadeUp">
              <div className="flex justify-between items-center border-b border-[#FAF7F2] pb-4 mb-6">
                <h2 className="font-display text-xl font-bold text-[#3D2B1F]">
                  {editId ? "تعديل بيانات المنتج" : "إضافة منتج جديد للمتجر"}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-[#8B7355] hover:text-[#3D2B1F] text-2xl font-light">×</button>
              </div>

              {error && <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4 border border-red-100">{error}</div>}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#8B7355] mb-1.5">اسم المنتج (بالعربي) *</label>
                    <input type="text" name="nameAr" value={formData.nameAr} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-[#E8DDD0] focus:outline-none focus:border-[#C9A96E] text-sm text-[#2C1810]" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#8B7355] mb-1.5">اسم المنتج (بالإنجليزي) *</label>
                    <input type="text" name="nameEn" value={formData.nameEn} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-[#E8DDD0] focus:outline-none focus:border-[#C9A96E] text-sm text-[#2C1810]" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#8B7355] mb-1.5">الوصف (بالعربي) *</label>
                    <textarea name="descAr" value={formData.descAr} onChange={handleChange} rows="3" className="w-full px-4 py-2.5 rounded-xl border border-[#E8DDD0] focus:outline-none focus:border-[#C9A96E] text-sm text-[#2C1810] resize-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#8B7355] mb-1.5">الوصف (بالإنجليزي) *</label>
                    <textarea name="descEn" value={formData.descEn} onChange={handleChange} rows="3" className="w-full px-4 py-2.5 rounded-xl border border-[#E8DDD0] focus:outline-none focus:border-[#C9A96E] text-sm text-[#2C1810] resize-none" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#8B7355] mb-1.5">السعر (ج.م) *</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-[#E8DDD0] text-sm text-[#2C1810]" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#8B7355] mb-1.5">الكمية في المخزن *</label>
                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-[#E8DDD0] text-sm text-[#2C1810]" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#8B7355] mb-1.5">القسم المخصص *</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-[#E8DDD0] text-sm bg-white text-[#2C1810]">
                      <option value="scented">شموع معطرة</option>
                      <option value="decorative">شموع ديكورية</option>
                      <option value="gifts">هدايا</option>
                      <option value="body">مرطبات الجسم</option>
                    </select>
                  </div>
                </div>

                {/* جزء رفع ألبوم الصور اللانهائي */}
                <div className="border-t border-[#FAF7F2] pt-4">
                  <label className="block text-xs font-bold text-[#3D2B1F] mb-2">ألبوم صور المنتج (اختر عدد لا نهائي من الصور) *</label>
                  <input 
                    type="file" multiple accept="image/*" onChange={handleImageChange}
                    className="w-full text-xs text-[#8B7355] file:ml-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#FAF7F2] file:text-[#8B7355] hover:file:bg-[#E8DDD0] cursor-pointer"
                  />

                  {existingImages.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[11px] text-[#8B7355] mb-1.5">الصور الحالية في الموقع:</p>
                      <div className="flex flex-wrap gap-2">
                        {existingImages.map((img, idx) => (
                          <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#E8DDD0]">
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-0 right-0 bg-red-600 text-white p-0.5 text-xs w-4 h-4 flex items-center justify-center rounded-bl-lg">×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {previews.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[11px] text-green-600 mb-1.5">صور جديدة سيتم حفظها:</p>
                      <div className="flex flex-wrap gap-2">
                        {previews.map((url, idx) => (
                          <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-green-200">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removePreview(idx)} className="absolute top-0 right-0 bg-gray-800 text-white p-0.5 text-xs w-4 h-4 flex items-center justify-center rounded-bl-lg">×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-2 text-xs text-[#3D2B1F] font-medium cursor-pointer">
                    <input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleChange} className="rounded accent-[#C9A96E]" />
                    تمييز كمنتج جديد
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[#3D2B1F] font-medium cursor-pointer">
                    <input type="checkbox" name="isBestSeller" checked={formData.isBestSeller} onChange={handleChange} className="rounded accent-[#C9A96E]" />
                    تمييز كأكثر مبيعاً
                  </label>
                </div>

                <div className="flex justify-end gap-3 border-t border-[#FAF7F2] pt-4 mt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 rounded-full text-xs font-medium border border-[#E8DDD0] text-[#8B7355] hover:bg-[#FAF7F2]" disabled={actionLoading}>
                    {t.cancel}
                  </button>
                  <button type="submit" className="bg-[#3D2B1F] text-white py-2 px-6 rounded-full text-xs font-medium hover:bg-[#C9A96E] transition-colors" disabled={actionLoading}>
                    {actionLoading ? t.loading : t.save}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminProducts;