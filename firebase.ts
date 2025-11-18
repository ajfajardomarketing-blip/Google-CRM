
import { initializeApp } from "firebase/app";
import { 
    getFirestore, 
    collection, 
    onSnapshot, 
    addDoc, 
    doc, 
    updateDoc, 
    setDoc, 
    getDocs, 
    query, 
    limit,
    deleteDoc,
    Unsubscribe,
    deleteField
} from "firebase/firestore";
import { firebaseConfig } from './firebaseConfig';
import { Lead, CampaignGroup, Campaign, GoalSettings, PlatformMetrics } from './types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// --- SEEDING ---
export const seedCollection = async (collectionName: string, data: any[]) => {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(query(collectionRef, limit(1)));
    if (snapshot.empty) {
        console.log(`'${collectionName}' collection is empty. Seeding with mock data...`);
        const promises = data.map(item => {
            const { id, ...itemData } = item;
            return setDoc(doc(db, collectionName, String(id)), itemData);
        });
        await Promise.all(promises);
        console.log(`Seeding for '${collectionName}' complete.`);
    }
};

// --- REAL-TIME LISTENERS ---
export const listenToCollection = <T>(collectionName: string, callback: (data: T[]) => void): Unsubscribe => {
    return onSnapshot(collection(db, collectionName), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
        callback(data);
    });
};

export const listenToDocument = <T>(collectionName: string, docId: string, callback: (data: T) => void, fallback?: () => void): Unsubscribe => {
    const docRef = doc(db, collectionName, docId);
    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data() as T);
        } else if (fallback) {
            fallback();
        }
    });
};

// --- WRITE OPERATIONS ---
export const addLead = async (newLead: Omit<Lead, 'id'>) => {
    try {
        // Create a URL-friendly slug from the lead's name
        const slug = newLead.name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // remove non-word chars
            .replace(/[\s_-]+/g, '-') // collapse whitespace and replace _ with -
            .replace(/^-+|-+$/g, ''); // remove leading/trailing dashes

        // Append a unique identifier (timestamp) to prevent collisions with identical names
        const uniqueId = `${slug}-${Date.now()}`;
        
        const leadDocRef = doc(db, 'leads', uniqueId);
        // Use setDoc to create a document with our custom ID
        await setDoc(leadDocRef, newLead);

    } catch (error) {
        console.error("Error adding lead: ", error);
        throw error; // Re-throw to be handled by the caller if needed
    }
};

export const updateLead = async (updatedLead: Lead) => {
    const { id, ...leadData } = updatedLead;
    const leadDocRef = doc(db, 'leads', id);
    const dataToUpdate: {[key: string]: any} = leadData;

    // If the incoming object from the form doesn't have certain optional fields,
    // we interpret it as a request to remove them from the database using deleteField().
    if (!('dealValue' in dataToUpdate)) {
        dataToUpdate.dealValue = deleteField();
    }
    if (!('jobTitle' in dataToUpdate)) {
        dataToUpdate.jobTitle = deleteField();
    }
    if (!('notes' in dataToUpdate)) {
        dataToUpdate.notes = deleteField();
    }
    
    try {
        await updateDoc(leadDocRef, dataToUpdate);
    } catch (error) {
        console.error("Error updating lead: ", error);
        throw error;
    }
};

export const deleteLead = async (leadId: string) => {
    const leadDocRef = doc(db, 'leads', leadId);
    try {
        await deleteDoc(leadDocRef);
    } catch (error) {
        console.error("Error deleting lead: ", error);
        throw error;
    }
};

export const addCampaignGroup = async (newGroup: Omit<CampaignGroup, 'id' | 'order'>) => {
    try {
        const groupsCollection = collection(db, 'campaignGroups');
        const snapshot = await getDocs(groupsCollection);
        const newOrder = snapshot.size; // Assigns order based on current number of groups
        const groupToAdd = { ...newGroup, order: newOrder };
        await addDoc(groupsCollection, groupToAdd);
    } catch(error) {
        console.error("Error adding campaign group: ", error);
        throw error;
    }
};

export const updateCampaignGroup = async (updatedGroup: CampaignGroup) => {
    const { id, ...groupData } = updatedGroup;
    const groupDocRef = doc(db, 'campaignGroups', id);
    try {
        await updateDoc(groupDocRef, groupData);
    } catch (error) {
        console.error("Error updating campaign group: ", error);
        throw error;
    }
};

export const deleteCampaignGroup = async (groupId: string) => {
    const groupDocRef = doc(db, 'campaignGroups', groupId);
    try {
        await deleteDoc(groupDocRef);
    } catch (error) {
        console.error("Error deleting campaign group: ", error);
        throw error;
    }
};

export const addCampaign = async (newCampaign: Omit<Campaign, 'id' | 'leads' | 'cost'>) => {
    const campaignToAdd = {
      ...newCampaign,
      leads: 0,
      cost: 0,
    };
    try {
        await addDoc(collection(db, 'campaigns'), campaignToAdd);
    } catch (error) {
        console.error("Error adding campaign: ", error);
        throw error;
    }
};

export const updateCampaign = async (updatedCampaign: Campaign) => {
    const { id, ...campaignData } = updatedCampaign;
    const campaignDocRef = doc(db, 'campaigns', id);
    try {
        await updateDoc(campaignDocRef, campaignData);
    } catch (error) {
        console.error("Error updating campaign: ", error);
        throw error;
    }
};

export const deleteCampaign = async (campaignId: string) => {
    const campaignDocRef = doc(db, 'campaigns', campaignId);
    try {
        await deleteDoc(campaignDocRef);
    } catch (error) {
        console.error("Error deleting campaign: ", error);
        throw error;
    }
};

export const updateGoals = async (newGoals: GoalSettings) => {
    const goalsDocRef = doc(db, 'settings', 'goals');
    try {
        await setDoc(goalsDocRef, newGoals);
    } catch (error) {
        console.error("Error updating goals: ", error);
        throw error;
    }
};

export const updateActualMetrics = async (newMetrics: PlatformMetrics[]) => {
    const metricsDocRef = doc(db, 'settings', 'actualMetrics');
    try {
        // Firestore works with objects, so we wrap our array in an object field.
        await setDoc(metricsDocRef, { data: newMetrics });
    } catch (error) {
        console.error("Error updating actual metrics: ", error);
        throw error;
    }
};

// Also export firestore functions to be used in the query component
export { collection, getDocs, doc, setDoc, addDoc, updateDoc, query, limit, deleteDoc };
