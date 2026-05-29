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
  const { field } = useLang();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // الحالة الجديدة المحدثة
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
        oldPrice: product.oldPrice || "",
        stock: product.stock !== undefined ? product.stock : "",
        showStock: product.showStock !== undefined ? product.showStock : true,
        category: product.category || "scented",
        isNew: product.isNew || false,
        isBestSeller: product.isBestSeller || false
      });
      setExistingUrls(Array.isArray(product.imageUrl) ? product.imageUrl : (product.imageUrl ? [product.imageUrl] : []));
      setExistingPaths(Array.isArray(product.imagePath) ? product.imagePath : (product.imagePath ? [product.imagePath] : []));
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
    try {
      const productData = {
        nameAr: formData.nameAr,
        nameEn: formData.nameEn,
        descAr: formData.descAr,
        descEn: formData.descEn,
        price: Number(formData.price),
        oldPrice: Number(formData.oldPrice) || 0,
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
        if (imageFiles.length === 0) throw new Error("برجاء اختيار صورة واحدة على الأقل");
        const docRef = await addProduct({ ...productData, imageUrl: [], imagePath: [] });
        const uploaded = await uploadMultipleImages(imageFiles, docRef.id);
        await updateProduct(docRef.id, { imageUrl: uploaded.urls, imagePath: uploaded.paths });
      }
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]" dir="rtl">
      <Navbar />
      <div className="max-w-[1200px] mx-auto p-6 md:p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-[#3D2B1F]">إدارة منتجات Lemo Store</h1>
          <button onClick={() => openModal()} className="bg-[#3D2B1F] text-white font-bold px-8 py-3 rounded-xl">+ إضافة قطعة جديدة</button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-x-auto border border-[#E8DDD0]">
          <table className="w-full text-right border-collapse">
            <thead className="bg-[#3D2B1F] text-white text-sm">
              <tr>
                <th className="p-4">صورة</th><th className="p-4">المنتج</th><th className="p-4">السعر</th><th className="p-4">المخزون</th><th className="p-4">تحكم</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b">
                  <td className="p-4"><img src={Array.isArray(p.imageUrl)?p.imageUrl[0]:p.imageUrl} className="w-12 h-12 object-cover rounded-lg"/></td>
                  <td className="p-4 font-bold">{p.nameAr}</td>
                  <td className="p-4">
                    <span className="font-bold">{p.price} ج.م</span>
                    {p.oldPrice > 0 && <span className="text-xs text-gray-400 line-through mr-2">{p.oldPrice}</span>}
                  </td>
                  <td className="p-4">{p.stock} قطعة {p.showStock ? "✅" : "❌"}</td>
                  <td className="p-4"><button onClick={() => openModal(p)} className="text-[#C9A96E] font-bold">تعديل</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-black mb-6">{editId ? "تعديل القطعة" : "إضافة قطعة"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input name="nameAr" placeholder="الاسم بالعربي" value={formData.nameAr} onChange={handleChange} className="p-3 border rounded-xl" required />
                  <input name="nameEn" placeholder="الاسم بالإنجليزي" value={formData.nameEn} onChange={handleChange} className="p-3 border rounded-xl" required />
                </div>
                
                <textarea name="descAr" placeholder="الوصف بالعربي" value={formData.descAr} onChange={handleChange} className="w-full p-3 border rounded-xl" required />
                <textarea name="descEn" placeholder="الوصف بالإنجليزي" value={formData.descEn} onChange={handleChange} className="w-full p-3 border rounded-xl" required />
                
                <div className="grid grid-cols-3 gap-4">
                  <input name="price" type="number" placeholder="السعر الحالي" value={formData.price} onChange={handleChange} className="p-3 border rounded-xl" required />
                  <input name="oldPrice" type="number" placeholder="السعر القديم" value={formData.oldPrice} onChange={handleChange} className="p-3 border rounded-xl" />
                  <input name="stock" type="number" placeholder="المخزون" value={formData.stock} onChange={handleChange} className="p-3 border rounded-xl" required />
                </div>
                
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input type="checkbox" name="showStock" checked={formData.showStock} onChange={handleChange} /> إظهار المخزون للعميل
                </label>

                <input type="file" multiple onChange={handleImageChange} className="w-full" />
                <button type="submit" disabled={actionLoading} className="w-full bg-[#3D2B1F] text-white p-4 rounded-xl font-bold">
                  {actionLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;