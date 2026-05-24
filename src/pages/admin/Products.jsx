import React, { useState, useEffect } from "react";
import { useLang } from "../../context/LangContext";
import { 
  subscribeToProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  uploadMultipleImages 
} from "../../firebase/products";

const AdminProducts = () => {
  const { t } = useLang();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({
    nameAr: "", nameEn: "", descAr: "", descEn: "", 
    price: "", stock: "", showStock: true, discount: "0",
    category: "scented", isNew: false, isBestSeller: false
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingUrls, setExistingUrls] = useState([]);
  const [existingPaths, setExistingPaths] = useState([]);

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
        nameAr: product.nameAr || "",
        nameEn: product.nameEn || "",
        descAr: product.descAr || "",
        descEn: product.descEn || "",
        price: product.price || "",
        stock: product.stock !== undefined ? product.stock : "",
        showStock: product.showStock !== undefined ? product.showStock : true,
        discount: product.discount !== undefined ? product.discount : "0",
        category: product.category || "scented",
        isNew: product.isNew || false,
        isBestSeller: product.isBestSeller || false
      });
      const urls = Array.isArray(product.imageUrl) ? product.imageUrl : (product.imageUrl ? [product.imageUrl] : []);
      const paths = Array.isArray(product.imagePath) ? product.imagePath : (product.imagePath ? [product.imagePath] : []);
      setExistingUrls(urls);
      setExistingPaths(paths);
    } else {
      setEditId(null);
      setFormData({ 
        nameAr: "", nameEn: "", descAr: "", descEn: "", 
        price: "", stock: "", showStock: true, discount: "0",
        category: "scented", isNew: false, isBestSeller: false 
      });
      setExistingUrls([]);
      setExistingPaths([]);
    }
    setShowModal(true);
  };

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
        showStock: formData.showStock,
        discount: Number(formData.discount),
        category: formData.category,
        isNew: formData.isNew,
        isBestSeller: formData.isBestSeller,
      };

      if (editId) {
        let finalUrls = [...existingUrls];
        let finalPaths = [...existingPaths];

        if (imageFiles.length > 0) {
          const uploaded = await uploadMultipleImages(imageFiles, editId);
          finalUrls = [...finalUrls, ...uploaded.urls];
          finalPaths = [...finalPaths, ...uploaded.paths];
        }

        await updateProduct(editId, { ...productData, imageUrl: finalUrls, imagePath: finalPaths });
      } else {
        if (imageFiles.length === 0) throw new Error("برجاء اختيار صورة واحدة على الأقل للمنتج الجديد");
        const docRef = await addProduct({ ...productData, imageUrl: [], imagePath: [] });
        const uploaded = await uploadMultipleImages(imageFiles, docRef.id);
        await updateProduct(docRef.id, { imageUrl: uploaded.urls, imagePath: uploaded.paths });
      }
      setShowModal(false);
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setActionLoading(false);
    }
  };

  const getDisplayImage = (imgField) => {
    if (Array.isArray(imgField)) return imgField[0] || "https://via.placeholder.com/60";
    return imgField || "https://via.placeholder.com/60";
  };

  const getExtraImagesCount = (imgField) => {
    if (Array.isArray(imgField)) return imgField.length;
    return imgField ? 1 : 0;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] p-6 md:p-10 font-sans" dir="rtl">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-[#E8DDD0]">
        <div>
          <h1 className="text-3xl font-bold text-[#3D2B1F] tracking-tight">لوحة تحكم منتجات ليمو لوكس</h1>
          <p className="text-sm text-[#8B7355] mt-1">إدارة الألبومات، المخزون الذكي، ونسب الخصومات التسويقية</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="bg-[#3D2B1F] hover:bg-[#2C1810] text-white font-medium px-6 py-3 rounded-xl shadow-sm transition-all duration-300 active:scale-95 text-sm"
        >
          + إضافة منتج جديد
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#8B7355] text-lg animate-pulse">جاري تحميل المنتجات...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8DDD0] shadow-sm overflow-hidden">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E8DDD0] text-[#8B7355] text-sm font-semibold">
                <th className="p-4 text-center w-28">الصور</th>
                <th className="p-4">اسم المنتج</th>
                <th className="p-4">التصنيف</th>
                <th className="p-4">السعر الأساسي</th>
                <th className="p-4">الخصم المعروض</th>
                <th className="p-4">حالة المخزون</th>
                <th className="p-4 text-center w-36">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF7F2] text-sm text-[#2C1810]">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF7F2]/50 transition-colors duration-200">
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center relative w-14 h-14 mx-auto">
                      <img src={getDisplayImage(p.imageUrl)} alt="" className="w-14 h-14 object-cover rounded-xl border border-[#E8DDD0]" />
                      {getExtraImagesCount(p.imageUrl) > 1 && (
                        <span className="absolute -top-1 -left-1 bg-[#C9A96E] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
                          +{getExtraImagesCount(p.imageUrl)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-base">{p.nameAr}</td>
                  <td className="p-4 text-[#8B7355]">
                    {p.category === "scented" ? "شموع معطرة" : p.category === "decorative" ? "شموع ديكورية" : p.category === "gifts" ? "هدايا فخمة" : "مرطبات الجسم"}
                  </td>
                  <td className="p-4 font-semibold text-[#3D2B1F]">{p.price} ج.م</td>
                  
                  <td className="p-4">
                    {p.discount > 0 ? (
                      <span className="bg-red-50 text-red-600 font-bold px-2.5 py-1 rounded-lg border border-red-100">
                        {p.discount}% خصم
                      </span>
                    ) : (
                      <span className="text-gray-400">لا يوجد عرض</span>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold">{p.stock || 0} قطعة</span>
                      {p.showStock ? (
                        <span className="text-[11px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded w-max border border-green-100">مرئي للمستخدم</span>
                      ) : (
                        <span className="text-[11px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded w-max border border-gray-200">مخفي عن المستخدم</span>
                      )}
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => openModal(p)} className="text-[#C9A96E] hover:text-[#3D2B1F] font-bold transition-colors">تعديل</button>
                      <span className="text-[#E8DDD0]">|</span>
                      <button onClick={() => { if(confirm("هل تود حذف المنتج وألبومه نهائياً؟")) deleteProduct(p.id, p.imagePath) }} className="text-red-500 hover:text-red-700 font-bold transition-colors">حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-[#3D2B1F]/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E8DDD0]">
            
            <div className="flex justify-between items-center p-6 border-b border-[#E8DDD0] sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-[#3D2B1F]">{editId ? "تحديث بيانات المنتج الفني" : "إضافة قطعة ديكورية جديدة"}</h3>
              <button onClick={() => setShowModal(false)} className="text-2xl text-[#8B7355] hover:text-[#3D2B1F]">&times;</button>
            </div>

            {error && <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs">{error}</div>}

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-[#8B7355] mb-1">اسم المنتج بالعربي *</label>
                <input type="text" name="nameAr" value={formData.nameAr} onChange={handleChange} className="w-full p-3 rounded-xl border border-[#E8DDD0] text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8B7355] mb-1">اسم المنتج بالإنجليزي *</label>
                <input type="text" name="nameEn" value={formData.nameEn} onChange={handleChange} className="w-full p-3 rounded-xl border border-[#E8DDD0] text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8B7355] mb-1">الوصف بالعربي *</label>
                <textarea name="descAr" value={formData.descAr} onChange={handleChange} rows="2" className="w-full p-3 rounded-xl border border-[#E8DDD0] text-sm resize-none" required />
              </div>

              <div className="grid grid-cols-2 gap-4 bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DDD0]">
                <div>
                  <label className="block text-xs font-bold text-[#3D2B1F] mb-1">السعر الأساسي (ج.م) *</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-[#E8DDD0] text-sm bg-white" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-red-600 mb-1">نسبة الخصم المخصوص (%)</label>
                  <input type="number" name="discount" value={formData.discount} onChange={handleChange} min="0" max="100" placeholder="مثال: 20" className="w-full p-2.5 rounded-lg border border-red-200 text-sm bg-white text-red-600 font-bold focus:border-red-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3D2B1F] mb-1">عدد قطع المخزون *</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-[#E8DDD0] text-sm bg-white" required />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#8B7355] cursor-pointer select-none">
                    <input type="checkbox" name="showStock" checked={formData.showStock} onChange={handleChange} className="w-4 h-4 rounded text-[#C9A96E] focus:ring-0" />
                    إظهار حجم المخزن للزبون
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8B7355] mb-1">القسم المخصص *</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 rounded-xl border border-[#E8DDD0] bg-white text-sm h-[46px]">
                  <option value="scented">شموع معطرة</option>
                  <option value="decorative">شموع ديكورية</option>
                  <option value="gifts">هدايا فخمة</option>
                  <option value="body">مرطبات الجسم</option>
                </select>
              </div>

              <div className="border-t border-dashed border-[#E8DDD0] pt-4">
                <label className="block text-sm font-bold text-[#3D2B1F] mb-1">ألبوم صور الشموع (صور متعددة معا) *</label>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="text-xs text-[#8B7355]" />
                
                {previews.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-3 bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DDD0]">
                    {previews.map((url, idx) => (
                      <img key={idx} src={url} alt="" className="w-12 h-12 object-cover rounded-lg border border-[#C9A96E]" />
                    ))}
                  </div>
                )}

                {editId && existingUrls.length > 0 && previews.length === 0 && (
                  <div className="mt-2">
                    <span className="block text-[11px] text-[#8B7355] mb-1">الصور الحالية على السيرفر:</span>
                    <div className="flex gap-2 flex-wrap bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DDD0]">
                      {existingUrls.map((url, idx) => (
                        <img key={idx} src={url} alt="" className="w-12 h-12 object-cover rounded-lg opacity-80" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleChange} className="rounded text-[#C9A96E]" /> تمييز كمنتج جديد</label>
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" name="isBestSeller" checked={formData.isBestSeller} onChange={handleChange} className="rounded text-[#C9A96E]" /> تمييز كأكثر مبيعاً</label>
              </div>

              <div className="flex gap-3 justify-end border-t border-[#E8DDD0] pt-4 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-[#E8DDD0] bg-[#FAF7F2] text-[#8B7355] text-sm">إلغاء</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#3D2B1F] hover:bg-[#2C1810] text-white font-bold text-sm shadow-sm" disabled={actionLoading}>
                  {actionLoading ? "جاري الحفظ والرفع..." : "حفظ التعديلات الفخمة"}
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