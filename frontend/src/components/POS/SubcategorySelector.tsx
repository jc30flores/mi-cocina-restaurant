import React, { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { usePOS } from "@/context/POSContext";

/**
 * Displays the sub-categories that belong to the currently active category.
 *
 * It behaves just like the CategorySelector component: a horizontal list of
 * buttons that allows the user to pick the active sub-category.  The list is
 * updated every time the active category changes.
 */
const SubcategorySelector = () => {
  const {
    activeCategory,
    subcategories,
    activeSubcategory,
    setActiveSubcategory,
    loading,
  } = usePOS();

  // Only keep subcategories that belong to the active category
  const filteredSubs = useMemo(
    () => subcategories.filter((sub) => sub.category_id === activeCategory),
    [subcategories, activeCategory]
  );

  // Order subcategories so that "Principal" appears first
  const orderedSubs = useMemo(() => {
    const principal = filteredSubs.find(
      (s) => s.name.toLowerCase() === "principal"
    );
    const others = filteredSubs.filter((s) => s.id !== principal?.id);
    return principal ? [principal, ...others] : others;
  }, [filteredSubs]);

  // When the active category changes select the first sub-category by default
  useEffect(() => {
    if (orderedSubs.length > 0) {
      const defaultId = orderedSubs[0].id; // already ordered with Principal first

      // Reset if current selection not in this category
      if (!orderedSubs.some((s) => s.id === activeSubcategory)) {
        setActiveSubcategory(defaultId);
      }
    } else if (activeSubcategory) {
      // No subcategories => clear selection
      setActiveSubcategory("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderedSubs, activeCategory]);

  if (loading) {
    return (
      <div className="p-2 flex overflow-x-auto gap-2 bg-card border-b">
        <div className="animate-pulse h-8 w-24 bg-muted rounded-md" />
        <div className="animate-pulse h-8 w-24 bg-muted rounded-md" />
        <div className="animate-pulse h-8 w-24 bg-muted rounded-md" />
      </div>
    );
  }

  // If the current category has no subcategories we don't render anything
  if (orderedSubs.length === 0) return null;

  return (
    <div className="p-2 flex flex-wrap gap-2 bg-card border-b">
      {orderedSubs.map((sub) => (
        <Button
          key={sub.id}
          variant="outline"
          className={`whitespace-nowrap ${activeSubcategory === sub.id ? 'text-black' : ''}`}
          style={activeSubcategory === sub.id ? { backgroundColor: '#FFA500' } : {}}
          onClick={() => setActiveSubcategory(sub.id)}
        >
          {sub.name}
        </Button>
      ))}
    </div>
  );
};

export default SubcategorySelector;
