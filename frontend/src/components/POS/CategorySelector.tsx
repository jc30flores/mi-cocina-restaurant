
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { usePOS } from "@/context/POSContext";

const CategorySelector = () => {
  const { categories, activeCategory, setActiveCategory, loading } = usePOS();

  // Set default category when categories are loaded
  useEffect(() => {
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory, setActiveCategory]);

  if (loading) {
    return (
      <div className="p-2 flex overflow-x-auto gap-2 bg-card border-b">
        <div className="animate-pulse h-10 w-24 bg-muted rounded-md"></div>
        <div className="animate-pulse h-10 w-24 bg-muted rounded-md"></div>
        <div className="animate-pulse h-10 w-24 bg-muted rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="p-2 flex flex-wrap gap-2 bg-card border-b">
      {categories.length === 0 ? (
        <div className="p-2 text-sm text-muted-foreground">No categories available</div>
      ) : (
        categories.map((cat) => (
          <Button
            key={cat.id}
            variant="outline"
            className={`whitespace-nowrap ${activeCategory === cat.id ? 'text-white' : ''}`}
            style={activeCategory === cat.id ? { backgroundColor: '#00B894' } : {}}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.name}
          </Button>
        ))
      )}
    </div>
  );
};

export default CategorySelector;
