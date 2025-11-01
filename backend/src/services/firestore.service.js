import admin from '../config/firebase-admin.js';

const db = admin.firestore();

const FirestoreService = {
  // Create a document
  async create(collection, data) {
    try {
      const docRef = await db.collection(collection).add({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      throw error;
    }
  },

  // Get a document by ID
  async getById(collection, id) {
    try {
      const doc = await db.collection(collection).doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw error;
    }
  },

  // Update a document
  async update(collection, id, data) {
    try {
      await db.collection(collection).doc(id).update({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { id, ...data };
    } catch (error) {
      throw error;
    }
  },

  // Delete a document
  async delete(collection, id) {
    try {
      await db.collection(collection).doc(id).delete();
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Get all documents from a collection
  async getAll(collection) {
    try {
      const snapshot = await db.collection(collection).get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw error;
    }
  },

  // Query documents
  async query(collection, queries = []) {
    try {
      let ref = db.collection(collection);
      
      queries.forEach(q => {
        ref = ref.where(q.field, q.operator, q.value);
      });

      const snapshot = await ref.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw error;
    }
  }
};

export default FirestoreService;