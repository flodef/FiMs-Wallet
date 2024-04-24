'use client';

import { Firestore, collection, onSnapshot, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

enum DatabaseAction {
  add,
  update,
  delete,
}

export function useData() {
  const [firestore, setFirestore] = useState<Firestore>();

  useEffect(() => {
    fetch(`./api/firebase`)
      .then(response => response.json())
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

        //TODO
        // if (change.type === 'added') {
        //     setTransactions((transactions) => [...transactions, data as Transaction]);
        // } else if (change.type === 'modified') {
        //     setTransactions((transactions) =>
        //         transactions.map((transaction) =>
        //             transaction.date === data.date ? { ...transaction, ...data } : transaction
        //         )
        //     );
        // } else if (change.type === 'removed') {
        //     setTransactions((transactions) =>
        //         transactions.filter((transaction) => transaction.date !== data.date)
        //     );
        // }
      });
    });

    return () => unsubscribe();
  }, [firestore]);

  //   const saveTransactions = useCallback(
  //     (action: DatabaseAction, transaction: Transaction) => {
  //       if (!transaction) return;

  //       transaction.modifiedDate = new Date().getTime();
  //       transaction.validator = user.name;

  //       if (transactions.length) {
  //         localStorage.setItem(transactionsFilename, JSON.stringify(transactions));
  //       } else {
  //         localStorage.removeItem(transactionsFilename);
  //       }

  //       const index = transaction.createdDate;
  //       transactionId.current = action === DatabaseAction.update ? index : 0;

  //       if (!firestore) return;

  //       switch (action) {
  //         case DatabaseAction.add:
  //           setDoc(doc(firestore, transactionsFilename, index.toString()), transaction);
  //           break;
  //         case DatabaseAction.update:
  //           updateDoc(doc(firestore, transactionsFilename, index.toString()), {
  //             method: PROCESSING_KEYWORD,
  //           });
  //           break;
  //         case DatabaseAction.delete:
  //           updateDoc(doc(firestore, transactionsFilename, index.toString()), {
  //             method: DELETED_KEYWORD,
  //           });
  //           break;
  //       }
  //     },
  //     [transactionsFilename, transactions, user, firestore],
  //   );

  //   const deleteTransaction = useCallback(
  //     (index?: number) => {
  //       if (!transactions.length) return;

  //       index = index ?? transactions.findIndex(({ createdDate }) => createdDate === transactionId.current);

  //       if (index >= 0) {
  //         const transaction = transactions.splice(index, 1)[0];
  //         saveTransactions(DatabaseAction.delete, transaction);
  //       }
  //     },
  //     [transactions, saveTransactions],
  //   );

  //   const toCurrency = useCallback(
  //     (element: { amount: number; currency?: Currency } | number | Product | Transaction) => {
  //       const currency =
  //         (typeof element !== 'number' && element.hasOwnProperty('currency')
  //           ? (element as { currency: Currency }).currency
  //           : undefined) ?? currencies[currencyIndex];
  //       const amount = element.hasOwnProperty('amount') ? (element as { amount: number }).amount : (element as number);
  //       return amount.toCurrency(currency.maxDecimals, currency.symbol);
  //     },
  //     [currencies, currencyIndex],
  //   );

  //   const toMercurial = useCallback(
  //     (quantity: number, mercurial = currentMercurial) => {
  //       switch (mercurial) {
  //         case Mercurial.exponential:
  //           return Math.pow(2, quantity - 1);
  //         case Mercurial.soft:
  //           return quantity <= 2
  //             ? quantity
  //             : Array(quantity - 1)
  //                 .fill(1)
  //                 .map((_, i) => i + 1)
  //                 .reduce((a, b) => a + b);
  //         case Mercurial.zelet:
  //           return quantity <= 2 ? quantity : Math.pow(quantity, 2);
  //         default:
  //           return quantity;
  //       }
  //     },
  //     [currentMercurial],
  //   );

  //   const fromMercurial = useCallback(
  //     (quantity: number, maxValue: number, mercurial = currentMercurial) => {
  //       quantity = Math.floor(quantity);
  //       while (toMercurial(quantity, mercurial) > maxValue) {
  //         quantity--;
  //       }
  //       return quantity;
  //     },
  //     [toMercurial, currentMercurial],
  //   );

  //   const getCurrentTotal = useCallback(() => {
  //     return products.current ? products.current.reduce((t, { total }) => t + (total ?? 0), 0) : 0;
  //   }, [products]);

  //   const updateTotal = useCallback(() => {
  //     setTotal(getCurrentTotal());
  //   }, [getCurrentTotal]);

  //   const clearAmount = useCallback(() => {
  //     setAmount(0);
  //     setQuantity(0);
  //     setCurrentMercurial(mercurial);
  //     setSelectedProduct(undefined);
  //     updateTotal();
  //   }, [updateTotal, mercurial]);

  //   const clearTotal = useCallback(() => {
  //     products.current = [];
  //     deleteTransaction();
  //     clearAmount();
  //   }, [clearAmount, deleteTransaction]);

  //   const computeQuantity = useCallback(
  //     (product: Product, quantity: number) => {
  //       const maxValue = currencies[currencyIndex].maxValue;
  //       const quadratic = toMercurial(quantity, product.mercurial);

  //       product.quantity = Math.max(
  //         1,
  //         product.amount * quadratic <= maxValue
  //           ? quantity
  //           : fromMercurial(maxValue / product.amount, maxValue, product.mercurial),
  //       );
  //       product.total = product.amount * toMercurial(product.quantity, product.mercurial);

  //       setQuantity(product.quantity);
  //       updateTotal();
  //     },
  //     [currencies, currencyIndex, toMercurial, fromMercurial, updateTotal],
  //   );

  //   const addProduct = useCallback(
  //     (item?: Product) => {
  //       const product = item ?? selectedProduct;
  //       if (!product) return;

  //       const newQuantity = item ? product.quantity : 1;

  //       if (!product.label && !product.category) return;

  //       const p = products.current.find(
  //         ({ label, category, amount }) =>
  //           label === product.label && category === product.category && amount === product.amount,
  //       );
  //       if (p) {
  //         computeQuantity(p, newQuantity + p.quantity);
  //       } else {
  //         products.current.unshift(product);
  //         computeQuantity(product, newQuantity);
  //       }

  //       setSelectedProduct(p ?? product);
  //       setAmount(product.amount);
  //       setQuantity(product.amount ? -1 : 0);
  //     },
  //     [products, selectedProduct, computeQuantity],
  //   );

  //   const deleteProduct = useCallback(
  //     (index: number) => {
  //       if (!products.current.length || !products.current.at(index)) return;

  //       products.current.splice(index, 1).at(0);

  //       if (!products.current.length) {
  //         deleteTransaction();
  //       }

  //       clearAmount();
  //     },
  //     [products, clearAmount, deleteTransaction],
  //   );

  //   const removeProduct = useCallback(
  //     (item?: Product) => {
  //       const product = item ?? {
  //         category: selectedProduct?.category,
  //         label: selectedProduct?.label,
  //         amount: selectedProduct?.amount,
  //       };
  //       const p = products.current.find(
  //         ({ label, category, amount }) =>
  //           label === product.label && category === product.category && amount === product.amount,
  //       );

  //       if (!p) return;

  //       if (p.quantity === 1) {
  //         deleteProduct(products.current.indexOf(p));
  //       } else {
  //         computeQuantity(p, p.quantity - 1);
  //       }
  //     },
  //     [selectedProduct, products, computeQuantity, deleteProduct],
  //   );

  //   const displayProduct = useCallback(
  //     (product: Product, currency?: Currency) => {
  //       return (
  //         (product.label && product.label !== OTHER_KEYWORD ? product.label : product.category) +
  //         ' : ' +
  //         toCurrency({ amount: product.amount, currency: currency }) +
  //         ' x ' +
  //         product.quantity +
  //         ' = ' +
  //         toCurrency({ amount: product.total ?? 0, currency: currency })
  //       );
  //     },
  //     [toCurrency],
  //   );

  //   useEffect(() => {
  //     const processingTransaction = !products.current.length
  //       ? transactions.find(({ method, validator }) => method === PROCESSING_KEYWORD && validator === user.name)
  //       : undefined;
  //     if (processingTransaction) {
  //       transactionId.current = processingTransaction.createdDate;
  //       processingTransaction.products.forEach(addProduct);
  //     }
  //   }, [transactions, user, addProduct]);

  //   const editTransaction = useCallback(
  //     (index: number) => {
  //       if (!transactions.length) return;

  //       const transaction = transactions[index];
  //       setCurrency(transaction.currency.label);
  //       transaction.products.forEach(addProduct);
  //       transaction.method = PROCESSING_KEYWORD;

  //       saveTransactions(DatabaseAction.update, transaction);
  //     },
  //     [transactions, saveTransactions, addProduct],
  //   );

  //   const updateTransaction = useCallback(
  //     (item: string | Transaction) => {
  //       if (!item || (typeof item === 'string' && !products.current.length)) return;

  //       const currentTime = new Date().getTime();
  //       const transaction: Transaction =
  //         typeof item === 'object'
  //           ? item
  //           : {
  //               validator: '',
  //               method: item,
  //               amount: getCurrentTotal(),
  //               createdDate: transactionId.current || currentTime,
  //               modifiedDate: 0,
  //               currency: currencies[currencyIndex],
  //               products: products.current,
  //             };

  //       const index = transactions.findIndex(({ createdDate }) => createdDate === transaction.createdDate);
  //       if (index >= 0) {
  //         transactions.splice(index, 1, transaction);
  //       } else {
  //         transactions.unshift(transaction);
  //       }

  //       transactions.sort((a, b) => (isWaitingTransaction(a) && !isWaitingTransaction(b) ? -1 : 1)); // Put the waiting transaction at the beginning of the list

  //       saveTransactions(DatabaseAction.add, transaction);

  //       clearTotal();
  //     },
  //     [
  //       clearTotal,
  //       products,
  //       saveTransactions,
  //       transactions,
  //       getCurrentTotal,
  //       isWaitingTransaction,
  //       currencies,
  //       currencyIndex,
  //     ],
  //   );

  //   const displayTransaction = useCallback(
  //     (transaction: Transaction) => {
  //       return (
  //         toCurrency(transaction) +
  //         (isWaitingTransaction(transaction) ? ' ' : ' en ') +
  //         transaction.method +
  //         ' à ' +
  //         new Date(transaction.createdDate).toTimeString().slice(0, 9)
  //       );
  //     },
  //     [toCurrency, isWaitingTransaction],
  //   );

  return {};
}
