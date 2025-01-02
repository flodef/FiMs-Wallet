'use client';

import { Firestore, collection, onSnapshot, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export function useDatabase() {
  const [firestore, setFirestore] = useState<Firestore>();

  useEffect(() => {
    fetch(`./api/firebase`)
      .then(response => response.ok && response.json())
      .then(setFirestore)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!firestore) return;

    const q = query(collection(firestore, 'transactionsFilename'));
    const unsubscribe = onSnapshot(q, querySnapshot => {
      querySnapshot.docChanges().forEach(change => {
        // change type can be 'added', 'modified', or 'deleted'
        const data = change.doc.data();
        console.log(change.type, data);
      });
    });

    return () => unsubscribe();
  }, [firestore]);

  return {};
}
