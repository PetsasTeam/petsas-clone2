import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';

// Consistent UK date formatting function
function formatUKDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default async function AdminBlogPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📰 Blog Management</h1>
        <Link
          href="/admin/blog/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          ✨ Create New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first blog post!</p>
          <Link
            href="/admin/blog/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Post
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category & Features
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Languages & Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URLs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16">
                          {post.imageUrl ? (
                            <Image
                              src={post.imageUrl}
                              alt={post.title}
                              width={64}
                              height={64}
                              className="h-16 w-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                              <span className="text-2xl">📄</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-gray-900">
                              {post.title || post.titleRu || 'Untitled'}
                            </div>
                            {post.featured && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                ⭐ Featured
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {post.summary || post.summaryRu || 'No summary'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {post.category && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            📂 {post.category}
                          </span>
                        )}
                        <div className="text-xs text-gray-500">
                          Views: {post.views || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">🇬🇧 EN:</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            post.published 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {post.published ? '✅ Published' : '⏳ Draft'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">🇷🇺 RU:</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            post.publishedRu 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {post.publishedRu ? '✅ Published' : '⏳ Draft'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">
                          🇬🇧 /en/blog/{post.slug || 'no-slug'}
                        </div>
                        <div className="text-xs text-gray-500">
                          🇷🇺 /ru/blog/{post.slugRu || 'no-slug'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatUKDate(new Date(post.createdAt))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        ✏️ Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 
 