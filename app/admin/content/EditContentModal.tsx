'use client';

import { useState, useEffect } from 'react';
import { updateSiteContent, createSiteContent } from './actions';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

// Rich text editor configuration
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'color': [] }, { 'background': [] }],
    ['link'],
    ['clean']
  ],
};

const quillFormats = [
  'header', 'bold', 'italic', 'underline',
  'list', 'bullet', 'color', 'background', 'link'
];

interface SiteContentItem {
  id: string;
  key: string;
  type: string;
  value: string;
  altText: string | null;
  linkUrl: string | null;
  group: string;
}

interface EditContentModalProps {
  item: SiteContentItem | null;
  onClose: () => void;
}

// Default content templates for terms sections
const defaultTermsContent = {
  'terms-general-info': `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
    <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h4 class="font-semibold text-gray-900 mb-3 text-base">Prepayments:</h4>
      <p class="text-gray-600 text-sm leading-relaxed">For certain car groups, prepayment may be required.</p>
    </div>
    <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h4 class="font-semibold text-gray-900 mb-3 text-base">Age Requirements:</h4>
      <p class="text-gray-600 text-sm leading-relaxed">Minimum age 21 years with valid driving license for at least 1 year.</p>
    </div>
    <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h4 class="font-semibold text-gray-900 mb-3 text-base">Documentation:</h4>
      <p class="text-gray-600 text-sm leading-relaxed">Valid driving license and credit card required for all rentals.</p>
    </div>
  </div>`,
  'terms-additional-services': `<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
    <div class="bg-white p-5 rounded-xl flex justify-between items-center shadow-sm border border-gray-100">
      <span class="font-semibold text-gray-700">Baby Seats & Booster Seats</span>
      <span class="text-blue-600 font-medium">Available</span>
    </div>
    <div class="bg-white p-5 rounded-xl flex justify-between items-center shadow-sm border border-gray-100">
      <span class="font-semibold text-gray-700">GPS Navigation System</span>
      <span class="text-blue-600 font-medium">Available</span>
    </div>
    <div class="bg-white p-5 rounded-xl flex justify-between items-center shadow-sm border border-gray-100">
      <span class="font-semibold text-gray-700">Additional Drivers</span>
      <span class="text-blue-600 font-medium">Available</span>
    </div>
    <div class="bg-white p-5 rounded-xl flex justify-between items-center shadow-sm border border-gray-100">
      <span class="font-semibold text-gray-700">Ski Racks & Equipment</span>
      <span class="text-blue-600 font-medium">Available</span>
    </div>
  </div>`,
  'terms-payment-methods': `<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
    <div class="bg-white p-6 rounded-xl text-center shadow-md border border-gray-100">
      <h4 class="font-semibold text-gray-900 mb-3">Online Payments</h4>
      <p class="text-gray-600 mb-4">We accept major credit cards</p>
      <div class="flex justify-center space-x-2">
        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Visa</span>
        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Mastercard</span>
        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">American Express</span>
      </div>
    </div>
    <div class="bg-white p-6 rounded-xl text-center shadow-md border border-gray-100">
      <h4 class="font-semibold text-gray-900 mb-3">Pay on Arrival</h4>
      <p class="text-gray-600 mb-4">Cash or card payment at pickup</p>
      <div class="text-green-600 font-medium">10% Discount Available</div>
    </div>
  </div>`
};

// Function to extract editable text from HTML structure
const extractEditableContent = (htmlContent: string, contentKey: string) => {
  if (contentKey === 'terms-general-info') {
    // Extract text from each card while preserving structure
    const cards = [
      { title: 'Prepayments:', defaultText: 'For certain car groups, prepayment may be required.' },
      { title: 'Age Requirements:', defaultText: 'Minimum age 21 years with valid driving license for at least 1 year.' },
      { title: 'Documentation:', defaultText: 'Valid driving license and credit card required for all rentals.' },
      { title: 'Insurance:', defaultText: 'Comprehensive coverage included for rentals of 7+ days.' },
      { title: 'Fuel Policy:', defaultText: 'Return vehicle with same fuel level as pickup.' },
      { title: 'Cancellation:', defaultText: 'Free cancellation up to 24 hours before pickup.' }
    ];
    
    // Try to extract existing content, fallback to defaults
    const extractedCards = cards.map((card, index) => {
      const regex = new RegExp(`<h4[^>]*>${card.title}</h4>\\s*<p[^>]*>([^<]*)</p>`, 'i');
      const match = htmlContent.match(regex);
      return {
        title: card.title,
        text: match ? match[1].trim() : card.defaultText
      };
    });
    
    return extractedCards;
  }
  return null;
};

// Function to rebuild HTML structure with new content
const rebuildHtmlStructure = (editableContent: any[], contentKey: string) => {
  if (contentKey === 'terms-general-info') {
    const cardsHtml = editableContent.map(card => `
    <div class="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h4 class="font-semibold text-gray-900 mb-3 text-base">${card.title}</h4>
      <p class="text-gray-600 text-sm leading-relaxed">${card.text}</p>
    </div>`).join('');
    
    return `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">${cardsHtml}
  </div>`;
  }
  return '';
};

export default function EditContentModal({ item, onClose }: EditContentModalProps) {
  // Check if this is a terms-related content
  const isTermsContent = item?.key?.startsWith('terms-') || false;
  const isGeneralInfo = item?.key === 'terms-general-info';
  
  const [formData, setFormData] = useState({
    key: item?.key || '',
    type: item?.type || (isTermsContent ? 'richtext' : 'text'),
    group: item?.group || 'General',
    value: item?.value || '',
    altText: item?.altText || '',
    linkUrl: item?.linkUrl || '',
  });
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(item?.value || '');
  const [showPreview, setShowPreview] = useState(false);
  const [safeEditMode, setSafeEditMode] = useState(isGeneralInfo);
  const [editableCards, setEditableCards] = useState<any[]>([]);

  useEffect(() => {
    if (isGeneralInfo && item?.value) {
      const extracted = extractEditableContent(item.value, item.key);
      if (extracted) {
        setEditableCards(extracted);
      }
    }
  }, [item, isGeneralInfo]);

  const handleCardTextChange = (index: number, newText: string) => {
    const updatedCards = [...editableCards];
    updatedCards[index].text = newText;
    setEditableCards(updatedCards);
    
    // Rebuild HTML and update form data
    const newHtml = rebuildHtmlStructure(updatedCards, item?.key || '');
    setFormData(prev => ({ ...prev, value: newHtml }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'value' && formData.type !== 'richtext') {
      setPreviewUrl(value);
    }
  };
  
  const handleQuillChange = (value: string) => {
    setFormData(prev => ({ ...prev, value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const response = await fetch('/api/admin/content/upload-image', {
        method: 'POST',
        body: uploadFormData,
      });

      const result = await response.json();
      if (result.success) {
        setFormData(prev => ({ ...prev, value: result.url }));
        setPreviewUrl(result.url);
      } else {
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitFormData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
        if (value) {
            submitFormData.append(key, value);
        }
    });

    if (item) {
        submitFormData.append('id', item.id);
        await updateSiteContent(submitFormData);
    } else {
        await createSiteContent(submitFormData);
    }
    
    onClose();
  };

  const isNew = !item;

  const resetToDefault = () => {
    if (item?.key && defaultTermsContent[item.key as keyof typeof defaultTermsContent]) {
      setFormData(prev => ({
        ...prev,
        value: defaultTermsContent[item.key as keyof typeof defaultTermsContent]
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {isNew ? 'Add New Content' : `Edit Content: ${item.key}`}
            {isTermsContent && <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">Terms & Conditions</span>}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isNew && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
                <input
                  type="text"
                  name="key"
                  value={formData.key}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="richtext">Rich Text</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
                <input
                  type="text"
                  name="group"
                  value={formData.group}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Value
              {isTermsContent && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-600 ml-2">
                    {safeEditMode ? '(Safe Edit Mode - Layout Protected)' : '(Rich Text Editor - Use toolbar for formatting)'}
                  </span>
                  <div className="flex space-x-2">
                    {isGeneralInfo && (
                      <button
                        type="button"
                        onClick={() => setSafeEditMode(!safeEditMode)}
                        className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-full transition-colors"
                      >
                        {safeEditMode ? 'Advanced Mode' : 'Safe Edit Mode'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-full transition-colors"
                    >
                      {showPreview ? 'Edit Mode' : 'Preview Mode'}
                    </button>
                  </div>
                </div>
              )}
            </label>
            
            {(formData.type === 'richtext' || isTermsContent) ? (
              <div className="space-y-4">
                {!showPreview ? (
                  safeEditMode && isGeneralInfo ? (
                    // Safe Edit Mode for General Info
                    <div className="space-y-4 border border-gray-300 rounded-md p-4 bg-gray-50">
                      <div className="text-sm font-medium text-green-800 mb-4">
                        🛡️ Safe Edit Mode - Edit text without breaking the card layout
                      </div>
                      {editableCards.map((card, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {card.title}
                          </label>
                          <textarea
                            value={card.text}
                            onChange={(e) => handleCardTextChange(index, e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Enter description for this card..."
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Regular Rich Text Editor
                    <div className="border border-gray-300 rounded-md overflow-hidden">
                      <style jsx global>{`
                        .ql-editor {
                          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                          font-size: 14px;
                          line-height: 1.6;
                          min-height: 250px;
                        }
                        .ql-toolbar {
                          border-bottom: 1px solid #e5e7eb;
                          background-color: #f9fafb;
                        }
                        .ql-container {
                          border: none;
                        }
                        .ql-editor h1, .ql-editor h2, .ql-editor h3 {
                          margin-top: 1rem;
                          margin-bottom: 0.5rem;
                        }
                        .ql-editor ul, .ql-editor ol {
                          padding-left: 1.5rem;
                        }
                        .ql-editor li {
                          margin-bottom: 0.25rem;
                        }
                      `}</style>
                      <ReactQuill
                        theme="snow"
                        value={formData.value}
                        onChange={handleQuillChange}
                        modules={quillModules}
                        formats={quillFormats}
                        style={{ height: '350px', marginBottom: '50px' }}
                        placeholder="Enter your content here... Use the toolbar above for formatting."
                      />
                    </div>
                  )
                ) : (
                  <div className="border border-gray-300 rounded-md p-4 bg-gray-50 min-h-[400px]">
                    <div className="text-xs text-gray-600 mb-3 font-medium">Preview (How it will appear on the website):</div>
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: formData.value }}
                    />
                  </div>
                )}
                
                {isTermsContent && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Editing Terms Content
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            {safeEditMode && isGeneralInfo 
                              ? '🛡️ Safe Edit Mode is ON - Your card layout is protected. Only text content can be changed.'
                              : 'You\'re editing Terms & Conditions content. Use the rich text editor to format your content with headings, lists, and styling.'
                            }
                            {!safeEditMode && ' Click "Preview Mode" to see how it will appear on the website.'}
                          </p>
                        </div>
                        {item?.key && defaultTermsContent[item.key as keyof typeof defaultTermsContent] && (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={resetToDefault}
                              className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1 rounded-full transition-colors"
                            >
                              Reset to Default Format
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : formData.type === 'image' ? (
              <input
                type="text"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Image URL or upload below"
                required
              />
            ) : (
              <textarea
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            )}
          </div>

          {formData.type === 'image' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload New Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={uploading}
                />
                {uploading && <p className="text-sm text-blue-600 mt-1">Uploading...</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preview
                </label>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-md border"
                  onError={() => setPreviewUrl('/placeholder-image.jpg')}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alt Text
            </label>
            <input
              type="text"
              name="altText"
              value={formData.altText}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link URL (optional)
            </label>
            <input
              type="text"
              name="linkUrl"
              value={formData.linkUrl}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., /about, /promotions"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={uploading}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
 