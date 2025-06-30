'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  summary?: string;
  imageUrl: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface BlogPreviewClientProps {
  locale: string;
}

// Consistent UK date formatting function
function formatUKDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function BlogPreviewClient({ locale }: BlogPreviewClientProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/blog/recent');
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <section className="py-5 px-5" style={{ background: '#f0f4f8' }}>
        <div className="mx-auto" style={{ maxWidth: '1400px' }}>
          <div className="grid gap-8 mb-8" style={{ 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 rounded-xl" style={{ aspectRatio: '16 / 9' }}></div>
                <div className="pt-6 space-y-3">
                  <div className="bg-gray-300 h-4 w-20 rounded"></div>
                  <div className="bg-gray-300 h-6 w-full rounded"></div>
                  <div className="bg-gray-300 h-4 w-3/4 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-5 px-5" style={{ background: '#f0f4f8' }}>
      <div className="mx-auto" style={{ maxWidth: '1400px' }}>
        {/* Blog Grid - matching promo banners style */}
        <div className="grid gap-8 mb-8" style={{ 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        }}>
          {posts.slice(0, 3).map((post) => (
            <Link href={`/${locale}/blog/${post.slug}`} key={post.id} className="group block">
              <article className="transition-all duration-300 cursor-pointer" style={{
                transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              }}>
                {/* Image section - same aspect ratio as promo banners */}
                <div 
                  className="relative w-full overflow-hidden bg-gray-100 transition-all duration-300 group-hover:-translate-y-2"
                  style={{
                    aspectRatio: '16 / 9',
                    borderRadius: '12px',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
                    transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  <Image
                    src={post.imageUrl || '/blog2.png'}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>
                
                {/* Content section - below image, Apple/Nike style */}
                <div className="pt-6 flex flex-col gap-3">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {formatUKDate(new Date(post.createdAt))}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-black transition-colors duration-300"
                      style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
                        letterSpacing: '-0.02em'
                      }}>
                    {post.title}
                  </h3>
                  
                  {post.summary && (
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 font-light"
                       style={{
                         fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif'
                       }}>
                      {post.summary}
                    </p>
                  )}
                  
                  <div className="pt-2">
                    <span className="text-black text-sm font-semibold group-hover:text-blue-600 transition-colors duration-300 flex items-center"
                          style={{
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif'
                          }}>
                      Read article
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
        
        {/* View All Button - Apple style */}
        <div className="text-center mt-8">
          <Link 
            href={`/${locale}/blog`} 
            className="inline-flex items-center px-8 py-4 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300 font-medium text-sm tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            View All Articles
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

 