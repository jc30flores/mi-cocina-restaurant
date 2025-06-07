
import React, { useState, useEffect } from "react";
import { EDITOR_TABLE_COLORS } from "@/lib/tableColors";
import { useNavigate } from "react-router-dom";
import {
  Plus, Trash2, Save, ArrowLeft, Grid, Move, Edit, AlertCircle, Copy,
  Square as RectIcon, Circle as CircleIcon, Type as TextIcon
} from "lucide-react";
// Replace Supabase with custom backend API
import {
  getTables,
  getSections,
  createTable,
  updateTable,
  deleteTable,
  createSection,
  updateSection,
  deleteSection,
  getMapElements,
  createMapElement,
  updateMapElement,
  deleteMapElement
} from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { TableMap, TableData } from "./TableMap";
import type { ElementData } from "./TableMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface SectionData {
  id: string;
  name: string;
}

interface TableData {
  id: string;
  number: string;
  capacity: number;
  // Table type: 'round' or 'square'
  shape?: 'round' | 'square';
  section_id: string | null;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  // Rotation in degrees
  rotation?: number;
  // Table color (e.g., '#ff0000')
  color?: string;
}

export const TableMapEditor = () => {
  // Default preset colors for tables
  const [presetColors, setPresetColors] = useState<string[]>(
    EDITOR_TABLE_COLORS
  );
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [sections, setSections] = useState([] as SectionData[]);
  const [tables, setTables] = useState([] as TableData[]);
  // Store original positions for cancel
  const [initialTables, setInitialTables] = useState([] as TableData[]);
  // Track unsaved changes for tables and elements
  const [isDirty, setIsDirty] = useState(false);
  // Key to force remount of TableMap to clear transforms
  const [mapKey, setMapKey] = useState(0);
  // Map elements state
  const [elements, setElements] = useState([] as ElementData[]);
  const [initialElements, setInitialElements] = useState([] as ElementData[]);
  const [selectedTable, setSelectedTable] = useState(null as TableData | null);
  const [selectedSection, setSelectedSection] = useState(null as SectionData | null);
  
  const [showAddTableDialog, setShowAddTableDialog] = useState(false);
  // Dialog for adding custom element
  const [showAddElementDialog, setShowAddElementDialog] = useState(false);
  const [showEditTableDialog, setShowEditTableDialog] = useState(false);
  const [showAddSectionDialog, setShowAddSectionDialog] = useState(false);
  const [showEditSectionDialog, setShowEditSectionDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  // Manage preset table colors
  const [showAddPresetColorDialog, setShowAddPresetColorDialog] = useState(false);
  const [newPresetColor, setNewPresetColor] = useState('#000000');
  
  const [newTableNumber, setNewTableNumber] = useState("");
  // New table type and size
  const [newTableType, setNewTableType] = useState('square' as 'round' | 'square');
  const [newTableWidth, setNewTableWidth] = useState("100");
  const [newTableHeight, setNewTableHeight] = useState("100");
  // New table rotation and color
  const [newTableRotation, setNewTableRotation] = useState("0");
  const [newTableColor, setNewTableColor] = useState("#000000");
  const [newTableCapacity, setNewTableCapacity] = useState("1");
  const [newTableSection, setNewTableSection] = useState("");
  // New element properties
  const [newElementType, setNewElementType] = useState('rect' as 'rect' | 'circle' | 'line' | 'text');
  const [newElementWidth, setNewElementWidth] = useState("100");
  const [newElementHeight, setNewElementHeight] = useState("100");
  const [newElementColor, setNewElementColor] = useState("#000000");
  const [newElementContent, setNewElementContent] = useState("");
  const [newElementRotation, setNewElementRotation] = useState("0");

  // Update element defaults when type changes in the Add Element modal
  useEffect(() => {
    // Width default stays 100 for all types
    setNewElementWidth("100");
    // Height defaults: 25 for text, 10 for line, 100 otherwise
    if (newElementType === 'text') {
      setNewElementHeight("25");
    } else if (newElementType === 'line') {
      setNewElementHeight("10");
    } else {
      setNewElementHeight("100");
    }
    // Rotation default: only for text
    setNewElementRotation(newElementType === 'text' ? "0" : "0");
    // Reset content and color defaults
    if (newElementType === 'text') {
      setNewElementContent("");
    }
    setNewElementColor("#000000");
  }, [newElementType]);
  
  const [newSectionName, setNewSectionName] = useState("");
  // Track deletion of table, section, or element
  const [itemToDelete, setItemToDelete] = useState({ type: 'table', id: '' } as { type: 'table' | 'section' | 'element'; id: string });
  // State for editing a map element
  const [showEditElementDialog, setShowEditElementDialog] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null as ElementData | null);

  // Load sections and tables from backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sectionsData = await getSections();
        setSections(sectionsData);
        const [tablesData, rawElements] = await Promise.all([getTables(), getMapElements()]);
        // Map snake_case to camelCase for font properties
        const elementsData = rawElements.map((e: any) => ({
          ...e,
          fontSize: e.font_size ?? 16,
          fontStyle: e.font_style ?? 'normal',
        }));
        setTables(tablesData);
        setInitialTables(tablesData);
        setElements(elementsData);
        setInitialElements(elementsData);
        setIsDirty(false);
      } catch (error) {
        console.error("Error fetching sections or tables:", error);
        toast({
          title: "Error",
          description: "Failed to load sections or tables",
          variant: "destructive"
        });
      }
    };

    fetchData();
  }, [toast]);

  // Set default selected section on load
  useEffect(() => {
    if (!selectedSection && sections.length > 0) {
      setSelectedSection(sections[0]);
    }
  }, [sections]);

  // Handle moving a table: update local state only; save to backend on saveAll
  const handleTableMove = (id: string, x: number, y: number) => {
    const updatedTables = tables.map(table =>
      table.id === id ? { ...table, position_x: x, position_y: y } : table
    );
    setTables(updatedTables);
    // Mark as dirty and bump mapKey to remount TableMap (clear motion transforms)
    if (!isDirty) {
      setIsDirty(true);
    }
    setMapKey(k => k + 1);
  };
  // Open dialog to add a new map element
  const openAddElement = (type: 'rect' | 'circle' | 'line' | 'text') => {
    setNewElementType(type);
    setNewElementWidth("100");
    // Default height: 25px for text, 10px for lines, 100px for other shapes
    setNewElementHeight(
      type === 'text' ? "25" : type === 'line' ? "10" : "100"
    );
    setNewElementColor("#000000");
    setNewElementContent("");
    setShowAddElementDialog(true);
  };
  // Create the new map element via API
  const handleCreateElement = async () => {
    if (!newElementType || !newElementWidth || !newElementHeight || !newElementColor) {
      toast({ title: 'Missing Info', description: 'Fill out all element fields', variant: 'destructive' });
      return;
    }
    try {
      const baseX = 50;
      const baseY = 50;
      const payload: any = {
        type: newElementType,
        position_x: baseX,
        position_y: baseY,
        width: parseInt(newElementWidth, 10),
        height: parseInt(newElementHeight, 10),
        // Allow text elements to have rotation
        rotation: newElementType === 'text' ? parseInt(newElementRotation, 10) : 0,
        color: newElementColor,
      };
      if (newElementType === 'text') {
        payload.content = newElementContent || 'Text';
        // Default font size and style for new text elements
        payload.font_size = 16;
        payload.font_style = 'normal';
        // Apply rotation for text
        payload.rotation = parseInt(newElementRotation, 10);
      }
      // Associate element with the selected section
      if (selectedSection) {
        payload.section_id = selectedSection.id;
      }
      const newElem = await createMapElement(payload);
      setElements(prev => [...prev, newElem]);
      setInitialElements(prev => [...prev, newElem]);
      setIsDirty(true);
      setMapKey(k => k + 1);
      setShowAddElementDialog(false);
      toast({ title: 'Element Added', description: `${newElementType} added.` });
    } catch (error) {
      console.error('Error creating element:', error);
      toast({ title: 'Error', description: 'Failed to add element', variant: 'destructive' });
    }
  };
  // Handle moving an element on the map
  const handleElementMove = (id: string, x: number, y: number) => {
    const updated = elements.map(el => el.id === id ? { ...el, position_x: x, position_y: y } : el);
    setElements(updated);
    if (!isDirty) setIsDirty(true);
    setMapKey(k => k + 1);
  };
  // Add a new map element of a given type
  const handleAddElement = async (type: 'rect' | 'circle' | 'line' | 'text') => {
    const baseX = 50;
    const baseY = 50;
    const width = 100;
    // Default height: 25px for text, 10px for lines, 100px for other shapes
    const height = type === 'text' ? 25 : type === 'line' ? 10 : 100;
    const payload: any = { type, position_x: baseX, position_y: baseY, width, height, rotation: 0 };
    if (type === 'text') {
      payload.content = 'Text';
    }
    try {
      // Associate element with the selected section
      if (selectedSection) {
        payload.section_id = selectedSection.id;
      }
      const newElem = await createMapElement(payload);
      setElements(prev => [...prev, newElem]);
      setInitialElements(prev => [...prev, newElem]);
      setIsDirty(true);
      setMapKey(k => k + 1);
      toast({ title: 'Element Added', description: `${type} added to map.` });
    } catch (error) {
      console.error('Error adding element:', error);
      toast({ title: 'Error', description: 'Failed to add element', variant: 'destructive' });
    }
  };

  // Select a table for actions (e.g., rotate)
  const handleTableSelect = (id: string) => {
    const table = tables.find(t => t.id === id);
    if (table) {
      setSelectedTable(table);
    }
  };
  // Rotate table by delta degrees
  const handleRotateTable = (id: string, delta: number) => {
    const updated = tables.map(t =>
      t.id === id ? { ...t, rotation: ((t.rotation || 0) + delta) % 360 } : t
    );
    setTables(updated);
    setIsDirty(true);
    setMapKey(k => k + 1);
  };
  // Select an element for actions (e.g., rotate)
  const handleElementSelect = (id: string) => {
    const el = elements.find(e => e.id === id);
    if (el) {
      setSelectedElement(el);
    }
  };
  // Rotate element by delta degrees
  const handleRotateElement = (id: string, delta: number) => {
    const updated = elements.map(e =>
      e.id === id ? { ...e, rotation: ((e.rotation || 0) + delta) % 360 } : e
    );
    setElements(updated);
    setIsDirty(true);
    setMapKey(k => k + 1);
  };
  // Cancel unsaved moves: revert positions
  const handleCancelChanges = () => {
    setTables(initialTables);
    setIsDirty(false);
  };
  // Save new positions to backend
  const handleSaveChanges = async () => {
    const changed = tables.filter(t => {
      const orig = initialTables.find(ot => ot.id === t.id);
      return (
        orig &&
        (
          orig.position_x !== t.position_x ||
          orig.position_y !== t.position_y ||
          orig.rotation !== t.rotation
        )
      );
    });
    const changedEl = elements.filter(e => {
      const orig = initialElements.find(oe => oe.id === e.id);
      return (
        orig && (
          orig.position_x !== e.position_x ||
          orig.position_y !== e.position_y ||
          // include text style changes
          orig.rotation !== e.rotation ||
          orig.content !== e.content ||
          orig.fontSize !== e.fontSize ||
          orig.fontStyle !== e.fontStyle
        )
      );
    });
    try {
      await Promise.all(
        changed.map(t => updateTable(t.id, {
          position_x: t.position_x,
          position_y: t.position_y,
          rotation: t.rotation
        }))
      );
      await Promise.all(
        changedEl.map(e => updateMapElement(e.id, {
          position_x: e.position_x,
          position_y: e.position_y,
          // persist rotation only for text
          ...(e.type === 'text' ? { rotation: e.rotation } : {}),
          content: e.content,
          // persist text style
          ...(e.fontSize !== undefined ? { font_size: e.fontSize } : {}),
          ...(e.fontStyle ? { font_style: e.fontStyle } : {}),
        }))
      );
      toast({ title: 'Changes Saved', description: 'Table positions updated successfully.' });
      // Refresh data
      const [newTables, newElements] = await Promise.all([getTables(), getMapElements()]);
      setInitialTables(newTables);
      setTables(newTables);
      setInitialElements(newElements);
      setElements(newElements);
      setIsDirty(false);
    } catch (error) {
      console.error('Error saving table positions:', error);
      toast({ title: 'Error', description: 'Failed to save positions', variant: 'destructive' });
    }
  };

  const handleAddTable = async () => {
    if (!newTableNumber || !newTableType || !newTableWidth || !newTableHeight || !newTableCapacity || !newTableSection) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // Prepare new table data with a random free position
      const baseX = 50;
      const baseY = 50;
      const tableData = {
        number: newTableNumber,
        capacity: parseInt(newTableCapacity, 10),
        section_id: newTableSection,
        position_x: baseX + Math.random() * 100,
        position_y: baseY + Math.random() * 100,
        status: 'available',
        shape: newTableType,
        width: parseInt(newTableWidth, 10),
        height: parseInt(newTableHeight, 10),
        // Include rotation and color
        rotation: parseInt(newTableRotation, 10),
        color: newTableColor
      };
      await createTable(tableData);
      toast({
        title: "Table Added",
        description: `Table ${newTableNumber} has been added successfully.`
      });
      // Reset form and close dialog
      setNewTableNumber("");
      setNewTableType('square');
      setNewTableWidth("100");
      setNewTableHeight("100");
      setNewTableCapacity("1");
      setNewTableSection("");
      setShowAddTableDialog(false);
      // Refresh tables
      const tablesData = await getTables();
      setTables(tablesData);
    } catch (error) {
      console.error("Error adding table:", error);
      toast({
        title: "Error",
        description: "Failed to add table",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTable = async () => {
    if (!selectedTable) return;
    try {
      await updateTable(selectedTable.id, {
        number: selectedTable.number,
        capacity: selectedTable.capacity,
        section_id: selectedTable.section_id,
        shape: selectedTable.shape,
        width: selectedTable.width,
        height: selectedTable.height,
        // Include rotation and color
        rotation: selectedTable.rotation,
        color: selectedTable.color
      });
      toast({
        title: "Table Updated",
        description: `Table ${selectedTable.number} has been updated successfully.`
      });
      setShowEditTableDialog(false);
      // Refresh tables
      const tablesData = await getTables();
      setTables(tablesData);
    } catch (error) {
      console.error("Error updating table:", error);
      toast({
        title: "Error",
        description: "Failed to update table",
        variant: "destructive"
      });
    }
  };

  const handleAddSection = async () => {
    if (!newSectionName) {
      toast({
        title: "Missing Information",
        description: "Please enter a section name",
        variant: "destructive"
      });
      return;
    }
    try {
      await createSection({ name: newSectionName });
      toast({
        title: "Section Added",
        description: `Section "${newSectionName}" has been added successfully.`
      });
      // Reset form and close dialog
      setNewSectionName("");
      setShowAddSectionDialog(false);
      // Refresh sections
      const sectionsData = await getSections();
      setSections(sectionsData);
    } catch (error) {
      console.error("Error adding section:", error);
      toast({
        title: "Error",
        description: "Failed to add section",
        variant: "destructive"
      });
    }
  };

  const handleEditSection = async () => {
    if (!selectedSection || !selectedSection.name) return;
    try {
      await updateSection(selectedSection.id, { name: selectedSection.name });
      toast({
        title: "Section Updated",
        description: `Section has been renamed successfully.`
      });
      setShowEditSectionDialog(false);
      // Refresh sections
      const sectionsData = await getSections();
      setSections(sectionsData);
    } catch (error) {
      console.error("Error updating section:", error);
      toast({
        title: "Error",
        description: "Failed to update section",
        variant: "destructive"
      });
    }
  };

  // Handle deletion of table or section via backend API
  const handleDelete = async () => {
    try {
      if (itemToDelete.type === 'table') {
        await deleteTable(itemToDelete.id);
        toast({
          title: "Table Deleted",
          description: "Table has been removed successfully."
        });
        setTables(prev => prev.filter(t => t.id !== itemToDelete.id));
      } else if (itemToDelete.type === 'element') {
        // Delete map element
        await deleteMapElement(itemToDelete.id);
        toast({
          title: "Shape Deleted",
          description: "Shape has been removed successfully."
        });
        setElements(prev => prev.filter(e => e.id !== itemToDelete.id));
      } else {
        // Prevent deletion if section has tables assigned locally
        const hasTables = tables.some(t => t.section_id === itemToDelete.id);
        if (hasTables) {
          toast({
            title: "Cannot Delete Section",
            description: "This section contains tables. Move or delete them first.",
            variant: "destructive"
          });
          setShowDeleteConfirmDialog(false);
          return;
        }
        await deleteSection(itemToDelete.id);
        toast({
          title: "Section Deleted",
          description: "Section has been removed successfully."
        });
        setSections(prev => prev.filter(s => s.id !== itemToDelete.id));
      }
      setShowDeleteConfirmDialog(false);
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: `Failed to delete ${itemToDelete.type}`,
        variant: "destructive"
      });
    }
  };

  // Update a map element's properties via API
  const handleUpdateElement = async () => {
    if (!selectedElement) return;
    try {
      const { id, width, height, rotation, content, color, fontSize, fontStyle } = selectedElement;
      const payload: any = { width, height };
      // Only persist rotation for text elements
      if (selectedElement.type === 'text' && rotation !== undefined) payload.rotation = rotation;
      if (content !== undefined) payload.content = content;
      if (color !== undefined) payload.color = color;
      if (fontSize !== undefined) payload.font_size = fontSize;
      if (fontStyle !== undefined) payload.font_style = fontStyle;
      await updateMapElement(id, payload);
      // Update local state without re-fetch to preserve new font settings
      const updated = elements.map(e => e.id === id ? { ...e, ...payload } : e);
      setElements(updated);
      setInitialElements(updated);
      toast({ title: "Shape Updated", description: "Shape has been updated successfully." });
      setShowEditElementDialog(false);
    } catch (error) {
      console.error("Error updating element:", error);
      toast({ title: "Error", description: "Failed to update shape", variant: "destructive" });
    }
  };

  // Duplicate a map element (shape)
  const handleDuplicateElement = async (id: string) => {
    const orig = elements.find(e => e.id === id);
    if (!orig) return;
    try {
      const payload: any = { ...orig };
      delete payload.id;
      // Offset new element
      payload.position_x = orig.position_x + 20;
      payload.position_y = orig.position_y + 20;
      const newElem = await createMapElement(payload);
      setElements(prev => [...prev, newElem]);
      setInitialElements(prev => [...prev, newElem]);
      setIsDirty(true);
      setMapKey(k => k + 1);
      toast({ title: 'Element Duplicated', description: `${orig.type} duplicated.` });
    } catch (error) {
      console.error('Error duplicating element:', error);
      toast({ title: 'Error', description: 'Failed to duplicate element', variant: 'destructive' });
    }
  };

  const confirmDelete = (type: 'table' | 'section' | 'element', id: string) => {
    setItemToDelete({ type, id });
    setShowDeleteConfirmDialog(true);
  };

  const editSection = (section: SectionData) => {
    setSelectedSection(section);
    setShowEditSectionDialog(true);
  };

  // Filter tables and shapes to the current selected section
  const filteredTables = selectedSection
    ? tables.filter(t => t.section_id === selectedSection.id)
    : tables;
  const filteredElements = selectedSection
    ? elements.filter(e => e.section_id === selectedSection.id)
    : elements;

  return <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-4 border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
              <ArrowLeft />
            </Button>
            <h1 className="text-xl font-bold">Table Layout Editor</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Section Selection Dropdown moved here */}
            <Select
              value={selectedSection?.id || ''}
              onValueChange={(value) => {
                const sec = sections.find(s => s.id === value) || null;
                setSelectedSection(sec);
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select Section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((sec) => (
                  <SelectItem key={sec.id} value={sec.id}>
                    {sec.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setShowAddSectionDialog(true)}
            >
              <Plus size={16} className="mr-2" /> Add Section
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAddTableDialog(true)}
            >
              <Plus size={16} className="mr-2" /> Add Table
            </Button>
            <Button
              variant="outline"
              onClick={() => openAddElement('rect')}
            >
              <RectIcon size={16} className="mr-2" /> Add Element
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with Sections and Tables */}
        <div className="lg:col-span-1 space-y-4">
          {/* Sections Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Restaurant Sections</span>
              </CardTitle>
              <CardDescription>Manage dining areas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {sections.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                  <p>No sections found</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setShowAddSectionDialog(true)}
                  >
                    <Plus size={16} className="mr-1" /> Add Section
                  </Button>
                </div>
              ) : (
                sections.map(section => (
                  <div key={section.id} className="flex items-center justify-between border p-2 rounded-md">
                    <span>{section.name}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => editSection(section)}>
                        <Edit size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => confirmDelete('section', section.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          
          {/* Tables Card */}
          <Card>
            <CardHeader>
              <CardTitle>Tables</CardTitle>
              <CardDescription>All tables in your restaurant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredTables.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                  <p>No tables found</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setShowAddTableDialog(true)}
                  >
                    <Plus size={16} className="mr-1" /> Add Table
                  </Button>
                </div>
              ) : (
                filteredTables.map(table => {
                  const section = sections.find(s => s.id === table.section_id);
                  return (
                    <div key={table.id} className="flex items-center justify-between border p-2 rounded-md">
                      <div>
                        <div className="font-medium">Table {table.number}</div>
                        <div className="text-xs text-muted-foreground">
                          {section?.name || 'No section'} • {table.capacity} seats
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            handleTableSelect(table.id);
                            setShowEditTableDialog(true);
                          }}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => confirmDelete('table', table.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
          {/* Shapes Card */}
          <Card>
            <CardHeader>
              <CardTitle>Shapes</CardTitle>
              <CardDescription>All shapes in this map</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredElements.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                  <p>No shapes found</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => openAddElement('rect')}
                  >
                    <Plus size={16} className="mr-1" /> Add Shape
                  </Button>
                </div>
              ) : (
                filteredElements.map((el, idx) => (
                  <div key={el.id} className="flex items-center justify-between border p-2 rounded-md">
                    <div>
                      <div className="font-medium">
                        {`${el.type.charAt(0).toUpperCase() + el.type.slice(1)} #${idx + 1}`}
                      </div>
                      {el.content && <div className="text-xs text-muted-foreground">{el.content}</div>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedElement(el); setShowEditElementDialog(true); }}>
                        <Edit size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDuplicateElement(el.id)}>
                        <Copy size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => confirmDelete('element', el.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Table Map */}
        <div className="lg:col-span-3 h-[calc(100vh-12rem)]">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle>Layout Preview</CardTitle>
              <CardDescription>Drag tables to position them on the map</CardDescription>
            </CardHeader>
            <CardContent className="relative h-[calc(100%-5rem)] overflow-x-auto">
              <TableMap
                key={mapKey}
                tables={filteredTables}
                elements={filteredElements}
                isEditMode={true}
                onTableMove={handleTableMove}
                onElementMove={handleElementMove}
                onTableRotate={handleRotateTable}
                onElementRotate={handleRotateElement}
                onTableSelect={handleTableSelect}
                onElementSelect={handleElementSelect}
                selectedTableId={selectedTable?.id}
                selectedElementId={selectedElement?.id}
              />
              {/* Save/Cancel buttons for moved tables */}
              {isDirty && (
                <div className="absolute bottom-4 right-4 flex space-x-2 z-20">
                  <Button variant="outline" onClick={handleCancelChanges}>Cancel</Button>
                  <Button onClick={handleSaveChanges}>
                    <Save className="mr-2" />Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Add Table Dialog */}
      <Dialog open={showAddTableDialog} onOpenChange={setShowAddTableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Table</DialogTitle>
            <DialogDescription>
              Create a new table for your restaurant layout.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tableNumber">Table Number</Label>
                <Input
                  id="tableNumber"
                  placeholder="e.g., 101"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tableType">Table Type</Label>
                <Select
                  value={newTableType}
                  onValueChange={(value) => setNewTableType(value as 'round' | 'square')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="round">Round</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tableWidth">Width (px)</Label>
                <Input
                  id="tableWidth"
                  type="number"
                  min="1"
                  value={newTableWidth}
                  onChange={(e) => setNewTableWidth(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tableHeight">Height (px)</Label>
                <Input
                  id="tableHeight"
                  type="number"
                  min="1"
                  value={newTableHeight}
                  onChange={(e) => setNewTableHeight(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tableCapacity">Capacity</Label>
                <Input
                  id="tableCapacity"
                  type="number"
                  min="1"
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tableSection">Section</Label>
                <Select
                  value={newTableSection}
                  onValueChange={setNewTableSection}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tableRotation">Rotation (deg)</Label>
              <Input
                id="tableRotation"
                type="number"
                min="0"
                value={newTableRotation}
                onChange={(e) => setNewTableRotation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2 items-center">
                {presetColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`w-6 h-6 rounded-full border-2 ${newTableColor === color ? 'border-white' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTableColor(color)}
                  />
                ))}
                <button
                  type="button"
                  className="w-6 h-6 flex items-center justify-center rounded border-2 border-dashed"
                  onClick={() => setShowAddPresetColorDialog(true)}
                >
                  +
                </button>
              </div>
            </div>
          </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTableDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTable}>
              Add Table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Add Element Dialog */}
      <Dialog open={showAddElementDialog} onOpenChange={setShowAddElementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Element</DialogTitle>
            <DialogDescription>
              Configure the new map element
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="elementType">Type</Label>
              <Select value={newElementType} onValueChange={(v) => setNewElementType(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rect">Rectangle</SelectItem>
                  <SelectItem value="circle">Circle</SelectItem>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="elementWidth">Width (px)</Label>
                <Input id="elementWidth" type="number" min="1" value={newElementWidth} onChange={(e) => setNewElementWidth(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="elementHeight">Height (px)</Label>
                <Input id="elementHeight" type="number" min="1" value={newElementHeight} onChange={(e) => setNewElementHeight(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="elementColor">Color</Label>
              <Input id="elementColor" type="color" value={newElementColor} onChange={(e) => setNewElementColor(e.target.value)} />
            </div>
            {newElementType === 'text' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="elementContent">Text</Label>
                  <Input
                    id="elementContent"
                    value={newElementContent}
                    onChange={(e) => setNewElementContent(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="elementRotation">Rotation (deg)</Label>
                  <Input
                    id="elementRotation"
                    type="number"
                    value={newElementRotation}
                    onChange={(e) => setNewElementRotation(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddElementDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateElement}>Add Element</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Table Dialog */}
      <Dialog open={showEditTableDialog} onOpenChange={setShowEditTableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Table</DialogTitle>
            <DialogDescription>
              Update table information.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTable && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editTableNumber">Table Number</Label>
                  <Input
                    id="editTableNumber"
                    value={selectedTable.number}
                    onChange={(e) => setSelectedTable({ ...selectedTable, number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editTableType">Table Type</Label>
                  <Select
                    value={selectedTable.shape || 'square'}
                    onValueChange={(value) => setSelectedTable({ ...selectedTable, shape: value as 'round' | 'square' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="round">Round</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editTableWidth">Width (px)</Label>
                  <Input
                    id="editTableWidth"
                    type="number"
                    min="1"
                    value={selectedTable.width}
                    onChange={(e) => setSelectedTable({ ...selectedTable, width: parseInt(e.target.value, 10) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editTableHeight">Height (px)</Label>
                  <Input
                    id="editTableHeight"
                    type="number"
                    min="1"
                    value={selectedTable.height}
                    onChange={(e) => setSelectedTable({ ...selectedTable, height: parseInt(e.target.value, 10) })}
                  />
                </div>
              </div>
              {/* Capacity for table */}
              <div className="space-y-2">
                <Label htmlFor="editTableCapacity">Capacity</Label>
                <Input
                  id="editTableCapacity"
                  type="number"
                  min="1"
                  value={selectedTable.capacity}
                  onChange={(e) => setSelectedTable({ ...selectedTable, capacity: parseInt(e.target.value, 10) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSection">Section</Label>
                <Select
                  value={selectedTable.section_id || ""}
                  onValueChange={(value) => setSelectedTable({ ...selectedTable, section_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            {/* Rotation and Color for table */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editTableRotation">Rotation (deg)</Label>
                <Input
                  id="editTableRotation"
                  type="number"
                  min="0"
                  value={selectedTable.rotation || 0}
                  onChange={(e) => setSelectedTable({ ...selectedTable, rotation: parseInt(e.target.value, 10) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2 items-center">
                  {presetColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-6 h-6 rounded-full border-2 ${selectedTable.color === color ? 'border-white' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedTable({ ...selectedTable, color })}
                    />
                  ))}
                  <button
                    type="button"
                    className="w-6 h-6 flex items-center justify-center rounded border-2 border-dashed"
                    onClick={() => setShowAddPresetColorDialog(true)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditTableDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => {
              if (selectedTable) {
                confirmDelete('table', selectedTable.id);
                setShowEditTableDialog(false);
              }
            }}>
              Delete
            </Button>
            <Button onClick={handleUpdateTable}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Section Dialog */}
      <Dialog open={showAddSectionDialog} onOpenChange={setShowAddSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
            <DialogDescription>
              Create a new dining area for your restaurant.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sectionName">Section Name</Label>
              <Input
                id="sectionName"
                placeholder="e.g., Outdoor Patio"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSectionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSection}>
              Add Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Section Dialog */}
      <Dialog open={showEditSectionDialog} onOpenChange={setShowEditSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>
              Update section information.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSection && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editSectionName">Section Name</Label>
                <Input
                  id="editSectionName"
                  value={selectedSection.name}
                  onChange={(e) => setSelectedSection({...selectedSection, name: e.target.value})}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditSectionDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => {
              if (selectedSection) {
                confirmDelete('section', selectedSection.id);
                setShowEditSectionDialog(false);
              }
            }}>
              Delete
            </Button>
            <Button onClick={handleEditSection}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Element Dialog */}
      <Dialog open={showEditElementDialog} onOpenChange={setShowEditElementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Shape</DialogTitle>
            <DialogDescription>Update shape properties.</DialogDescription>
          </DialogHeader>
          {selectedElement && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input value={selectedElement.type} disabled />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Width (px)</Label>
                  <Input
                    type="number"
                    value={selectedElement.width}
                    onChange={(e) => setSelectedElement({
                      ...selectedElement,
                      width: parseInt(e.target.value, 10)
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Height (px)</Label>
                  <Input
                    type="number"
                    value={selectedElement.height}
                    onChange={(e) => setSelectedElement({
                      ...selectedElement,
                      height: parseInt(e.target.value, 10)
                    })}
                  />
                </div>
              </div>
              {selectedElement.type === 'text' && (
                <>
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <Input
                      value={selectedElement.content || ''}
                      onChange={(e) => setSelectedElement({
                        ...selectedElement,
                        content: e.target.value
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rotation (deg)</Label>
                    <Input
                      type="number"
                      value={selectedElement.rotation || 0}
                      onChange={(e) => setSelectedElement({
                        ...selectedElement,
                        rotation: parseInt(e.target.value, 10)
                      })}
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label>Color</Label>
                <Input
                  type="color"
                  value={selectedElement.color || '#000000'}
                  onChange={(e) => setSelectedElement({
                    ...selectedElement,
                    color: e.target.value
                  })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditElementDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => {
              if (selectedElement) {
                confirmDelete('element', selectedElement.id);
                setShowEditElementDialog(false);
              }
            }}>
              Delete
            </Button>
            <Button onClick={handleUpdateElement}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Add Preset Color Dialog */}
      <Dialog open={showAddPresetColorDialog} onOpenChange={setShowAddPresetColorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Table Color</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Select New Color</Label>
              <Input
                type="color"
                value={newPresetColor}
                onChange={(e) => setNewPresetColor(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPresetColorDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setPresetColors(prev => [...prev, newPresetColor]);
              setShowAddPresetColorDialog(false);
            }}>
              Add Color
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {itemToDelete.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirmDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}; 
