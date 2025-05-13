import { useState, useEffect, useCallback } from 'react';

// Hook personalizado para implementar scroll infinito
// permite seguir cargando los elementos a medida que el usuario hace scroll
const useInfiniteScroll = (items, itemsPerPage = 9) => {
  const [displayedItems, setDisplayedItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [observerTarget, setObserverTarget] = useState(null);

  // Cargar más elementos cuando se detecta el scroll
  const loadMoreItems = useCallback(() => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    
    setTimeout(() => {
      const start = (page - 1) * itemsPerPage;
      const end = page * itemsPerPage;
      const nextItems = items.slice(start, end);
      
      if (nextItems.length > 0) {
        setDisplayedItems(prev => [...prev, ...nextItems]);
        setPage(prev => prev + 1);
      }
      
      if (end >= items.length) {
        setHasMore(false);
      }
      
      setLoadingMore(false);
    }, 300); // Pequeña demora para simular carga
  }, [page, items, itemsPerPage, loadingMore, hasMore]);

  // Configurar el Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreItems();
        }
      },
      { threshold: 0.1 }
    );
    
    if (observerTarget) {
      observer.observe(observerTarget);
    }
    
    return () => {
      if (observerTarget) {
        observer.unobserve(observerTarget);
      }
    };
  }, [observerTarget, loadMoreItems, hasMore]);

  // Reiniciar cuando cambian los items
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setDisplayedItems(items.slice(0, itemsPerPage));
  }, [items, itemsPerPage]);

  return {
    displayedItems,
    hasMore,
    loadingMore,
    setObserverTarget
  };
};

export default useInfiniteScroll;