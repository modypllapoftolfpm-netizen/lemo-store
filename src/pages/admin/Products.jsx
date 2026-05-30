import React, { useState, useEffect } from "react";
import { useLang } from "../../context/LangContext";
import { 
  subscribeToProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  uploadMultipleImages 
} from "../../firebase/products";
import Navbar from "../../components/layout/Navbar";

const AdminProducts = () => {
  const { t } = useLang();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // تم تعديل الـ State لإضافة oldPrice بدلاً من discount
  const [formData, setFormData] = useState({
    nameAr: "", nameEn: "", descAr: "", descEn: "", 
    price: "", oldPrice: "", stock: "", showStock: true,
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
        oldPrice: product.oldPrice || "", // استدعاء السعر القديم
        stock: product.stock !== undefined ? product.stock : "",
        showStock: product.showStock !== undefined ? product.showStock : true,
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
        price: "", oldPrice: "", stock: "", showStock: true,
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
        oldPrice: formData.oldPrice ? Number(formData.oldPrice) : null, // حفظ السعر القديم
        stock: Number(formData.stock),
        showStock: formData.showStock,
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

  return (
    <div className="min-h-screen bg-[#FAF8F5]" dir="rtl">
      <Navbar />
      
      <div className="max-w-[1200px] mx-auto p-6 md:p-10 font-sans">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-[#E8DDD0]">
          <div>
            <h1 className="text-3xl font-black text-[#3D2B1F] tracking-tight">إدارة منتجات Lemo Store</h1>
            <p className="text-sm text-[#8B7355] mt-1">إدارة الألبومات، المخزون الذكي، والخصومات الخاصة بمنتجاتنا اليدوية</p>
          </div>
          <button 
            onClick={() => openModal()} 
            className="bg-[#3D2B1F] hover:bg-[#111] text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all duration-300 active:scale-95 text-sm"
          >
            + إضافة قطعة فنية جديدة
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#8B7355] text-lg animate-pulse">جاري تحميل المنتجات...</div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#F0E8DF] shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#3D2B1F] text-white text-sm">
                  <th className="p-5 text-center w-28">الصور</th>
                  <th className="p-5">اسم المنتج</th>
                  <th className="p-5">التصنيف</th>
                  <th className="p-5">السعر الحالي</th>
                  <th className="p-5">السعر القديم</th>
                  <th className="p-5">المخزون</th>
                  <th className="p-5 text-center w-36">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF7F2] text-sm text-[#2C1810]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors duration-200">
                    <td className="p-4 text-center">
                      <div className="relative w-14 h-16 mx-auto">
                        <img src={getDisplayImage(p.imageUrl)} alt="" className="w-full h-full object-cover rounded-lg border border-[#E8DDD0]" />
                        {Array.isArray(p.imageUrl) && p.imageUrl.length > 1 && (
                          <span className="absolute -top-2 -left-2 bg-[#C9A96E] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-md">
                            +{p.imageUrl.length}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-base">{p.nameAr}</td>
                    <td className="p-4">
                      <span className="bg-[#FAF7F2] px-3 py-1 rounded-full text-[#8B7355] border border-[#E8DDD0]">
                        {p.category === "scented" ? "شموع معطرة" : p.category === "decorative" ? "شموع ديكورية" : p.category === "gifts" ? "هدايا فخمة" : "مرطبات الجسم"}
                      </span>
                    </td>
                    <td className="p-4 font-black text-[#3D2B1F]">{p.price} ج.م</td>
                    <td className="p-4">
                      {p.oldPrice ? (
                        <span className="text-gray-400 font-bold line-through">{p.oldPrice} ج.م</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold">{p.stock || 0} قطعة</span>
                        <span className={`text-[10px] font-bold ${p.showStock ? 'text-green-600' : 'text-gray-400'}`}>
                          {p.showStock ? "مرئي للزبون" : "مخفي"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openModal(p)} className="bg-[#FAF7F2] text-[#3D2B1F] px-4 py-2 rounded-lg font-bold hover:bg-[#E8DDD0] transition-all">تعديل</button>
                        <button onClick={() => { if(confirm("هل تود حذف المنتج نهائياً؟")) deleteProduct(p.id, p.imagePath) }} className="bg-red-50 text-red-500 px-4 py-2 rounded-lg font-bold hover:bg-red-100 transition-all">حذف</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-[#3D2B1F]/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E8DDD0]">
              <div className="flex justify-between items-center p-6 border-b border-[#FAF7F2] sticky top-0 bg-white z-10">
                <h3 className="text-xl font-black text-[#3D2B1F]">{editId ? `📝 تحديث قطعة في Lemo Store` : "✨ إضافة قطعة فنية جديدة"}</h3>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#3D2B1F] text-2xl font-light hover:bg-[#E8DDD0] transition-all flex items-center justify-center">&times;</button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                
                {/* صف الأسماء */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-[#8B7355] uppercase tracking-widest mb-2">الاسم بالعربي</label>
                    <input type="text" name="nameAr" value={formData.nameAr} onChange={handleChange} className="w-full p-3.5 rounded-xl border-2 border-[#FAF7F2] focus:border-[#C9A96E] outline-none transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-[#8B7355] uppercase tracking-widest mb-2">الاسم بالإنجليزي (اختياري)</label>
                    <input type="text" name="nameEn" value={formData.nameEn} onChange={handleChange} className="w-full p-3.5 rounded-xl border-2 border-[#FAF7F2] focus:border-[#C9A96E] outline-none transition-all" />
                  </div>
                </div>

                {/* صف الوصف (الجديد) */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-[#8B7355] uppercase tracking-widest mb-2">الوصف بالعربي</label>
                    <textarea name="descAr" value={formData.descAr} onChange={handleChange} rows="3" className="w-full p-3.5 rounded-xl border-2 border-[#FAF7F2] focus:border-[#C9A96E] outline-none transition-all resize-none" required placeholder="وصف القطعة ومكوناتها..."></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-[#8B7355] uppercase tracking-widest mb-2">الوصف بالإنجليزي (اختياري)</label>
                    <textarea name="descEn" value={formData.descEn} onChange={handleChange} rows="3" className="w-full p-3.5 rounded-xl border-2 border-[#FAF7F2] focus:border-[#C9A96E] outline-none transition-all resize-none" placeholder="Description..."></textarea>
                  </div>
                </div>

                {/* صف التسعير والمخزون */}
                <div className="bg-[#FAF8F5] p-6 rounded-2xl grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-black text-[#3D2B1F] mb-2">السعر الحالي (ج.م)</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-3 rounded-xl border border-[#E8DDD0] bg-white font-bold" required />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-red-600 mb-2">السعر القديم (اختياري)</label>
                    <input type="number" name="oldPrice" value={formData.oldPrice} onChange={handleChange} placeholder="يظهر مشطوباً" className="w-full p-3 rounded-xl border border-red-100 bg-white font-bold text-red-600 placeholder-red-300" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-black text-[#3D2B1F] mb-2">المخزون</label>
                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full p-3 rounded-xl border border-[#E8DDD0] bg-white font-bold" required />
                  </div>
                </div>

                {/* القسم */}
                <div>
                  <label className="block text-xs font-black text-[#8B7355] mb-2">القسم</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full p-3.5 rounded-xl border-2 border-[#FAF7F2] bg-white font-bold outline-none focus:border-[#C9A96E]">
                    <option value="scented">شموع معطرة</option>
                    <option value="decorative">شموع ديكورية</option>
                    <option value="gifts">هدايا فخمة</option>
                    <option value="body">مرطبات الجسم</option>
                  </select>
                </div>

                {/* الصور */}
                <div className="border-2 border-dashed border-[#E8DDD0] p-6 rounded-2xl text-center">
                  <label className="block text-sm font-black text-[#3D2B1F] mb-4">ألبوم صور القطعة (صور متعددة)</label>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#3D2B1F] file:text-white hover:file:bg-[#111] cursor-pointer" />
                  
                  {(previews.length > 0 || (editId && existingUrls.length > 0)) && (
                    <div className="flex gap-3 flex-wrap mt-6 justify-center">
                      {(previews.length > 0 ? previews : existingUrls).map((url, idx) => (
                        <img key={idx} src={url} alt="" className="w-16 h-16 object-cover rounded-xl border-2 border-[#C9A96E] shadow-sm" />
                      ))}
                    </div>
                  )}
                </div>

                {/* الخيارات الإضافية */}
                <div className="flex gap-4 p-4 bg-[#FAF7F2] rounded-xl">
                  <label className="flex items-center gap-2 text-sm font-bold cursor-pointer"><input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleChange} className="w-5 h-5 rounded text-[#C9A96E]" /> منتج جديد</label>
                  <label className="flex items-center gap-2 text-sm font-bold cursor-pointer"><input type="checkbox" name="isBestSeller" checked={formData.isBestSeller} onChange={handleChange} className="w-5 h-5 rounded text-[#C9A96E]" /> الأكثر مبيعاً</label>
                </div>

                {/* زر الحفظ */}
                <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                  <button type="submit" className="flex-1 p-4 rounded-2xl bg-[#3D2B1F] text-white font-black hover:bg-[#111] transition-all shadow-xl disabled:opacity-50" disabled={actionLoading}>
                    {actionLoading ? "جاري الرفع والحفظ..." : "حفظ في Lemo Store"}
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