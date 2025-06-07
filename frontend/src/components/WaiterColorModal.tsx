import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MODAL_WAITER_COLORS } from '@/lib/tableColors';

const WaiterColorModal: React.FC = () => {
  const { user, waiterColor, setWaiterColor } = useAuth();
  const [open, setOpen] = useState(false);
  // Load locked colors from localStorage
  const lockedColors: string[] = JSON.parse(localStorage.getItem('lockedColors') || '[]');
  // Available options: all modal colors except locked, but include current if selected
  const availableColors = MODAL_WAITER_COLORS.filter(c => c === waiterColor || !lockedColors.includes(c));
  const [color, setColor] = useState<string>(
    waiterColor || (availableColors.length > 0 ? availableColors[0] : MODAL_WAITER_COLORS[0])
  );

  useEffect(() => {
    if (user && !waiterColor) {
      setOpen(true);
    }
  }, [user, waiterColor]);

  const handleSave = () => {
    setWaiterColor(color);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Your Table Color</DialogTitle>
          <DialogDescription>
            Choose a color that will represent your tables in the POS.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-4 my-4">
          {availableColors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-10 h-10 rounded-full border-2 ${color === c ? 'border-white' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WaiterColorModal;