import React, { useState } from 'react';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import { useTemplate } from '../../hooks/useTemplate';
import { useAuth } from '../../contexts/AuthContext';
import { useImageUpload } from '../../hooks/useImageUpload';

interface MediaCarouselBuilderProps {
  onClose: () => void;
  onSave: () => void;
}

interface CarouselItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  buttons: Array<{ label: string; payload: string }>;
}

export default function MediaCarouselBuilder({ onClose, onSave }: MediaCarouselBuilderProps) {
  const { user } = useAuth();
  const { createTemplate } = useTemplate(user?.merchantId || '');
  const { getCompressionPreview } = useImageUpload();

  const [name, setName] = useState('');
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentItem, setCurrentItem] = useState<CarouselItem>({
    id: `item-${Date.now()}`,
    title: '',
    description: '',
    imageUrl: '',
    buttons: [],
  });

  const [newButton, setNewButton] = useState({ label: '', payload: '' });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const preview = await getCompressionPreview(file.size);
        if (preview?.dataUrl) {
          setCurrentItem({ ...currentItem, imageUrl: preview.dataUrl });
        }
      } catch (err) {
        setError('Failed to process image');
      }
    }
  };

  const addButton = () => {
    if (newButton.label.trim() && newButton.payload.trim()) {
      setCurrentItem({
        ...currentItem,
        buttons: [...currentItem.buttons, newButton],
      });
      setNewButton({ label: '', payload: '' });
    }
  };

  const removeButton = (index: number) => {
    setCurrentItem({
      ...currentItem,
      buttons: currentItem.buttons.filter((_, i) => i !== index),
    });
  };

  const saveItem = () => {
    if (!currentItem.title.trim() || !currentItem.description.trim()) {
      setError('Title and description are required');
      return;
    }

    if (editingItemIndex !== null) {
      const newItems = [...items];
      newItems[editingItemIndex] = currentItem;
      setItems(newItems);
      setEditingItemIndex(null);
    } else {
      setItems([...items, { ...currentItem, id: `item-${Date.now()}` }]);
    }

    setCurrentItem({
      id: `item-${Date.now()}`,
      title: '',
      description: '',
      imageUrl: '',
      buttons: [],
    });
    setNewButton({ label: '', payload: '' });
    setError(null);
  };

  const editItem = (index: number) => {
    setCurrentItem(items[index]);
    setEditingItemIndex(index);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Carousel name is required');
      return;
    }

    if (items.length < 2) {
      setError('Add at least 2 carousel items');
      return;
    }

    if (items.length > 10) {
      setError('Maximum 10 carousel items allowed');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await createTemplate({
        name,
        type: 'carousel',
        channel: 'whatsapp',
        language: 'en',
        body: 'Check out these items',
        carouselItems: items.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          imageUrl: item.imageUrl,
          buttons: item.buttons.map((btn) => ({
            id: `btn-${Math.random()}`,
            label: btn.label,
            type: 'url' as const,
            payload: btn.payload,
          })),
        })),
        merchantId: user?.merchantId || '',
        status: 'draft',
        variables: [],
        tags: ['carousel'],
        allowPreview: true,
        allowBroadcast: true,
        sendCount: 0,
      });
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save carousel');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Media Carousel Builder</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Item Editor */}
            <div className="space-y-6">
              {/* Carousel Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Carousel Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Featured Products"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>

              {/* Item Editor */}
              <div className="space-y-4 border-t border-gray-200 pt-6">
                <h3 className="font-medium text-gray-900">
                  {editingItemIndex !== null ? 'Edit Item' : 'Add Item'}
                </h3>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                  {currentItem.imageUrl ? (
                    <div className="relative">
                      <img
                        src={currentItem.imageUrl}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setCurrentItem({ ...currentItem, imageUrl: '' })}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm text-gray-600">Click to upload image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title *</label>
                  <input
                    type="text"
                    value={currentItem.title}
                    onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
                    placeholder="Item title"
                    maxLength={25}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">{currentItem.title.length}/25</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description *</label>
                  <textarea
                    value={currentItem.description}
                    onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                    placeholder="Item description"
                    maxLength={125}
                    rows={2}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">{currentItem.description.length}/125</p>
                </div>

                {/* Buttons */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buttons (Max 2)</label>
                  {currentItem.buttons.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {currentItem.buttons.map((btn, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                          <span>{btn.label}</span>
                          <button
                            type="button"
                            onClick={() => removeButton(idx)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {currentItem.buttons.length < 2 && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Button label"
                        value={newButton.label}
                        onChange={(e) => setNewButton({ ...newButton, label: e.target.value })}
                        maxLength={20}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Link or payload"
                        value={newButton.payload}
                        onChange={(e) => setNewButton({ ...newButton, payload: e.target.value })}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={addButton}
                        className="w-full inline-flex items-center justify-center px-2 py-1 border border-blue-600 rounded text-sm font-medium text-blue-600 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Button
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  {editingItemIndex !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItemIndex(null);
                        setCurrentItem({
                          id: `item-${Date.now()}`,
                          title: '',
                          description: '',
                          imageUrl: '',
                          buttons: [],
                        });
                        setNewButton({ label: '', payload: '' });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={saveItem}
                    className="flex-1 px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {editingItemIndex !== null ? 'Update Item' : 'Add Item'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Preview */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Preview</h3>
              <div className="bg-gray-100 rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
                {items.length > 0 && (
                  <>
                    <p className="text-sm text-gray-600 mb-4">Carousel Items ({items.length})</p>
                    {items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => editItem(idx)}
                      >
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-32 object-cover"
                          />
                        )}
                        <div className="p-3 space-y-2">
                          <h4 className="font-medium text-sm text-gray-900 line-clamp-1">{item.title}</h4>
                          <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
                          {item.buttons.length > 0 && (
                            <div className="space-y-1 pt-2 border-t border-gray-100">
                              {item.buttons.map((btn, bidx) => (
                                <button
                                  key={bidx}
                                  className="w-full px-2 py-1 text-xs font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                                  disabled
                                >
                                  {btn.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="bg-gray-50 px-3 py-2 flex items-center justify-between">
                          <span className="text-xs text-gray-500">Item {idx + 1}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItem(idx);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {items.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Add items to preview carousel</p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : 'Save Carousel'}
          </button>
        </div>
      </div>
    </div>
  );
}
