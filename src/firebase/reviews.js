import {
  collection, addDoc, onSnapshot, query,
  where, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

export const addReview = async (data) => {
  return await addDoc(collection(db, "reviews"), {
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToProductReviews = (productId, callback) => {
  const q = query(
    collection(db, "reviews"),
    where("productId", "==", productId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};