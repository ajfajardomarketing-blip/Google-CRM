

import React, { useState } from 'react';
// Import the db instance and firestore functions to make them available in the query scope
import { db, collection, getDocs, doc, setDoc, addDoc, updateDoc, query, limit, deleteDoc } from '../firebase';

const FirebaseQuery: React.FC = () => {
  const [queryString, setQueryString] = useState(
`// Example: Fetch the raw QuerySnapshot object
const leadsCol = collection(db, 'leads');
const q = query(leadsCol, limit(5));
const snapshot = await getDocs(q);
return snapshot;`
  );
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Recursively cleans a Firestore result object by converting Firestore-specific
   * types into JSON-serializable formats and handling circular references.
   * @param obj The object to clean.
   * @param seen A set to track visited objects to prevent infinite recursion.
   * @returns A cleaned, JSON-serializable object.
   */
  const cleanResultForJSON = (obj: any, seen = new WeakSet()): any => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (seen.has(obj)) {
        return '[Circular Reference]';
    }
    seen.add(obj);

    // Handle specific Firestore types first
    if (typeof obj.toDate === 'function') { // Timestamp
      return obj.toDate().toISOString();
    }
    if (Array.isArray(obj.docs) && obj.query) { // QuerySnapshot
      return obj.docs.map(d => cleanResultForJSON(d, seen));
    }
    if (typeof obj.data === 'function' && typeof obj.id === 'string') { // DocumentSnapshot
      return { id: obj.id, ...cleanResultForJSON(obj.data(), seen) };
    }
    
    // The main Firestore instance is a common source of circular refs.
    // It has a `type` of 'firestore' but lacks a `.firestore` property that sub-objects have.
    if (obj.type === 'firestore') {
        return '[Firestore Instance]';
    }
    
    // Most other SDK objects (DocRef, CollRef, Query) have a `.firestore` property referencing the main DB.
    // This is a good catch-all.
    if (obj.firestore) {
        if (obj.path) { // DocumentReference and CollectionReference have a path.
            return `[Reference: ${obj.path}]`;
        }
        return '[Firestore Object]'; // Fallback for other types like Query.
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => cleanResultForJSON(item, seen));
    }

    // At this point, assume it's a plain object (like document data) and recurse
    const cleaned: { [key: string]: any } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cleaned[key] = cleanResultForJSON(obj[key], seen);
      }
    }
    return cleaned;
  };


  const handleRunQuery = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      // Create an async function to execute the code
      // We pass the db and other firestore functions as arguments to make them available
      const queryFunction = new Function('db', 'collection', 'getDocs', 'doc', 'setDoc', 'addDoc', 'updateDoc', 'query', 'limit', 'deleteDoc', `
        return (async () => {
          ${queryString}
        })();
      `);

      const queryResult = await queryFunction(db, collection, getDocs, doc, setDoc, addDoc, updateDoc, query, limit, deleteDoc);
      
      const cleanedResult = cleanResultForJSON(queryResult);
      setResult(JSON.stringify(cleanedResult, null, 2));
    } catch (e: any) {
      // Catch both query errors and potential stringify errors
      if (e instanceof TypeError && e.message.includes('circular structure')) {
          setError(`JSON Serialization Error: ${e.message}. The query returned a complex object that could not be displayed.`);
      } else {
          setError(e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg mt-10">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white">Firebase Live Query Tool</h2>
        <p className="text-gray-400 mt-1 text-base">
          Interact with your Firestore database directly. The \`db\` instance and common Firestore functions (\`collection\`, \`getDocs\`, \`deleteDoc\`, etc.) are available.
          The code must return a value to be displayed.
        </p>
      </div>
      <div className="p-6">
        <div className="font-mono text-base bg-black rounded-lg p-4 h-64 overflow-auto">
          <textarea
            className="w-full h-full bg-transparent text-white border-none resize-none focus:outline-none"
            value={queryString}
            onChange={(e) => setQueryString(e.target.value)}
            placeholder="Write your Firestore query code here..."
          />
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleRunQuery}
            disabled={isLoading}
            className="bg-[#d356f8] text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-[#b844d9] transition duration-300 disabled:bg-[#9d39bc] disabled:cursor-not-allowed"
          >
            {isLoading ? 'Running...' : 'Run Query'}
          </button>
        </div>
        
        {(result || error) && (
            <div className="mt-6">
                <h3 className="text-xl font-semibold text-white mb-2">{error ? 'Error' : 'Result'}</h3>
                <pre className={`p-4 rounded-lg overflow-auto max-h-96 text-base ${error ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>
                    <code>{result || error}</code>
                </pre>
            </div>
        )}
      </div>
    </div>
  );
};

export default FirebaseQuery;