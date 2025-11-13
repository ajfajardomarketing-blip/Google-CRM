

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
  const cleanResultForJSON = (obj: any, seen = new Set()): any => {
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    // For non-primitive types, check for circular references.
    if (typeof obj === 'object') {
        if (seen.has(obj)) {
            return '[Circular Reference]';
        }
        seen.add(obj);
    }

    // Firestore Timestamp: has toDate method
    if (obj.toDate && typeof obj.toDate === 'function') {
      return obj.toDate().toISOString();
    }
    
    // Firestore DocumentReference: has path and parent properties
    if (typeof obj.path === 'string' && obj.parent) {
      return `DocumentReference(path=${obj.path})`;
    }
    
    // Firestore DocumentSnapshot: has data() method and id property
    if (typeof obj.data === 'function' && typeof obj.id === 'string') {
      return { id: obj.id, ...cleanResultForJSON(obj.data(), seen) };
    }

    // Firestore QuerySnapshot: has docs property (array) and query property
    if (Array.isArray(obj.docs) && obj.query) {
      return obj.docs.map(doc => cleanResultForJSON(doc, seen));
    }
    
    // Recursively clean arrays
    if (Array.isArray(obj)) {
      return obj.map(item => cleanResultForJSON(item, seen));
    }

    // Recursively clean plain objects
    if (typeof obj === 'object' && Object.getPrototypeOf(obj) === Object.prototype) {
      const cleaned: { [key: string]: any } = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          cleaned[key] = cleanResultForJSON(obj[key], seen);
        }
      }
      return cleaned;
    }

    // For any unhandled complex objects that are not plain objects,
    // return a string representation to avoid serialization errors.
    if (typeof obj === 'object') {
        let objectType = 'Object';
        try {
            objectType = obj.constructor.name;
        } catch (e) { /* ignore */ }
        
        // A Query object will have a `type` property or specific methods
        if (obj.type === 'query' || obj.type === 'collection-group') {
             return `[Firestore Query]`;
        }

        // Fallback for any other complex object that made it this far
        return `[Unhandled Complex Type: ${objectType}]`;
    }

    // Return primitives and other types (like functions) as is
    return obj;
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
