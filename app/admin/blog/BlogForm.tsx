'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createPost, updatePost } from './actions';
import 'react-quill/dist/quill.snow.css';

interface Post {
  id: string;
  slug: string;
  slugRu: string | null;
  title: string;
  titleRu: string | null;
  summary: string | null;
  summaryRu: string | null;
  content: string;
  contentRu: string | null;
  imageUrl: string | null;
  published: boolean;
  publishedRu: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: string;
  featured: boolean;
}

interface BlogFormProps {
  post?: Post | null;
}

// Dynamic import to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

// Function to estimate reading time
function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// Predefined categories
const CATEGORIES = [
  'Travel Tips',
  'Rental Tips',
  'Cyprus Guide', 
  'Car Rental',
  'Local Culture',
  'Food & Dining',
  'Events',
  'News',
  'Safety',
  'Tourist Attractions',
  'Hidden Gems',
  'Announcements'
];

export default function BlogForm({ post }: BlogFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'en' | 'ru'>('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(post?.imageUrl || null);

  // Form state
  const [formData, setFormData] = useState({
    // English fields
    title: post?.title || '',
    slug: post?.slug || '',
    summary: post?.summary || '',
    content: post?.content || '',
    published: post?.published || false,
    
    // Russian fields
    titleRu: post?.titleRu || '',
    slugRu: post?.slugRu || '',
    summaryRu: post?.summaryRu || '',
    contentRu: post?.contentRu || '',
    publishedRu: post?.publishedRu || false,
    
    // New fields
    category: post?.category || '',
    featured: post?.featured || false,
    createdAt: post?.createdAt ? new Date(post.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });

  // Auto-generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  // Update slug when title changes
  useEffect(() => {
    if (formData.title && !post) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(prev.title)
      }));
    }
  }, [formData.title, post]);

  useEffect(() => {
    if (formData.titleRu && !post) {
      setFormData(prev => ({
        ...prev,
        slugRu: generateSlug(prev.titleRu)
      }));
    }
  }, [formData.titleRu, post]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'createdAt') {
            submitData.append(key, new Date(value as string).toISOString());
        } else if (typeof value === 'boolean') {
          submitData.append(key, value.toString());
        } else if (value) {
          submitData.append(key, value);
        }
      });

      // Add image if selected
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      let result;
      if (post) {
        submitData.append('id', post.id);
        result = await updatePost(submitData);
      } else {
        result = await createPost(submitData);
      }

      if (result.success) {
        router.push('/admin/blog');
        router.refresh();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('An error occurred while saving the post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const readingTimeEn = estimateReadingTime(formData.content);
  const readingTimeRu = formData.contentRu ? estimateReadingTime(formData.contentRu) : 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {post ? '✏️ Edit Blog Post' : '✨ Create New Blog Post'}
          </h1>
          <p className="text-gray-600 mt-2">
            {post ? 'Update your blog post content and settings' : 'Write and publish a new blog post'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Featured Post Toggle */}
          <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
              className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
            />
            <label htmlFor="featured" className="text-sm font-medium text-yellow-800">
              ⭐ Featured Post
            </label>
            <span className="text-xs text-yellow-600">
              Featured posts appear prominently on the blog homepage
            </span>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📂 Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Created At Date Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🗓️ Post Date
            </label>
            <input
              type="date"
              value={formData.createdAt}
              onChange={(e) => setFormData(prev => ({...prev, createdAt: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Featured Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🖼️ Featured Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {imagePreview && (
              <div className="mt-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>

          {/* Language Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                type="button"
                onClick={() => setActiveTab('en')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'en'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🇧 English Content
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ru')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'ru'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🇷🇺 Russian Content
              </button>
            </nav>
          </div>

          {/* English Content */}
          {activeTab === 'en' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Title (English) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter the post title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔗 URL Slug (English)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="url-friendly-slug"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Will be used in the URL: /en/blog/{formData.slug || 'your-slug'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📄 Summary (English)
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief summary for previews and SEO..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ✍️ Content (English) *
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                    style={{ minHeight: '300px' }}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="published" className="text-sm font-medium text-gray-700">
                  ✅ Publish English version
                </label>
              </div>
            </div>
          )}

          {/* Russian Content */}
          {activeTab === 'ru' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Title (Russian)
                </label>
                <input
                  type="text"
                  value={formData.titleRu}
                  onChange={(e) => setFormData(prev => ({ ...prev, titleRu: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Введите заголовок поста..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔗 URL Slug (Russian)
                </label>
                <input
                  type="text"
                  value={formData.slugRu}
                  onChange={(e) => setFormData(prev => ({ ...prev, slugRu: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="url-friendly-slug"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Will be used in the URL: /ru/blog/{formData.slugRu || 'your-slug'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📄 Summary (Russian)
                </label>
                <textarea
                  value={formData.summaryRu}
                  onChange={(e) => setFormData(prev => ({ ...prev, summaryRu: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Краткое описание для превью и SEO..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ✍️ Content (Russian)
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={formData.contentRu}
                    onChange={(value) => setFormData(prev => ({ ...prev, contentRu: value }))}
                    style={{ minHeight: '300px' }}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="publishedRu"
                  checked={formData.publishedRu}
                  onChange={(e) => setFormData(prev => ({ ...prev, publishedRu: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="publishedRu" className="text-sm font-medium text-gray-700">
                  ✅ Publish Russian version
                </label>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/admin/blog')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? '⏳ Saving...' : (post ? '💾 Update Post' : '🚀 Create Post')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
 