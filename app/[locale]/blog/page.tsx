import { prisma } from '@/lib/prisma';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';

const POSTS_PER_PAGE = 6;

// Consistent UK date formatting function
function formatUKDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

async function getFeaturedPost() {
  return prisma.post.findFirst({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function getPaginatedPosts(page: number, featuredPostId?: string) {
  const skip = (page - 1) * POSTS_PER_PAGE;
  
  const posts = await prisma.post.findMany({
    where: { 
      published: true,
      id: { not: featuredPostId } 
    },
    orderBy: { createdAt: 'desc' },
    skip: skip,
    take: POSTS_PER_PAGE,
  });

  const totalPosts = await prisma.post.count({ 
    where: { 
      published: true,
      id: { not: featuredPostId } 
    } 
  });
  
  return { posts, totalPosts };
}

interface BlogIndexPageProps {
  searchParams?: {
    page?: string;
  };
}

export default async function BlogIndexPage({ searchParams }: BlogIndexPageProps) {
  const currentPage = Number(searchParams?.page) || 1;
  const locale = await getLocale();

  const featuredPost = await getFeaturedPost();
  const { posts: otherPosts, totalPosts } = await getPaginatedPosts(currentPage, featuredPost?.id);

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Our Blog
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover the latest news, travel tips, and stories from Cyprus. 
              Your guide to exploring the island with Petsas Car Rental.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {!featuredPost && otherPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📝</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No articles yet</h3>
            <p className="text-gray-600 text-lg">
              We're working on some amazing content for you. Check back soon!
            </p>
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {featuredPost && (
              <section className="mb-20">
                <div className="flex items-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">Featured Article</h2>
                  <div className="ml-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Latest
                  </div>
                </div>
                
                <Link href={`/${locale}/blog/${featuredPost.slug}`} className="group block">
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden">
                      <Image
                        src={featuredPost.imageUrl || '/blog1.jpg'}
                        alt={featuredPost.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                          Featured
                        </span>
                        <span>{formatUKDate(new Date(featuredPost.createdAt))}</span>
                      </div>
                      
                      <h3 className="text-3xl md:text-4xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                        {featuredPost.title}
                      </h3>
                      
                      {featuredPost.summary && (
                        <p className="text-lg text-gray-600 leading-relaxed">
                          {featuredPost.summary}
                        </p>
                      )}
                      
                      <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-800 transition-colors">
                        Read full article
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* Other Articles */}
            {otherPosts.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-12">All Articles</h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {otherPosts.map((post) => (
                    <Link href={`/${locale}/blog/${post.slug}`} key={post.id} className="group block">
                      <article className="bg-white rounded-2xl overflow-hidden border border-gray-100 group-hover:border-blue-200 transition-all duration-300">
                        <div className="relative h-48 overflow-hidden rounded-t-2xl">
                          <Image
                            src={post.imageUrl || '/blog1.jpg'}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        
                        <div className="p-6 space-y-4">
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <span>{formatUKDate(new Date(post.createdAt))}</span>
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                            {post.title}
                          </h3>
                          
                          {post.summary && (
                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 flex-1">
                              {post.summary}
                            </p>
                          )}
                          
                          <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-800 transition-colors pt-2">
                            Read more
                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
                
                <PaginationControls 
                  currentPage={currentPage}
                  totalPages={totalPages}
                />
              </section>
            )}
          </>
        )}
      </div>

      {/* Newsletter Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Stay Updated
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Get the latest travel tips and news from Cyprus delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// PaginationControls Component
interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
}

function PaginationControls({ currentPage, totalPages }: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center space-x-4 mt-16">
      <Link 
        href={`?page=${currentPage - 1}`}
        className={`px-4 py-2 rounded-lg border ${currentPage === 1 ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
        aria-disabled={currentPage === 1}
        tabIndex={currentPage === 1 ? -1 : undefined}
      >
        Previous
      </Link>

      <div className="flex items-center space-x-2">
        {getPageNumbers().map((page, index) => (
          typeof page === 'number' ? (
            <Link 
              key={index}
              href={`?page=${page}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
            >
              {page}
            </Link>
          ) : (
            <span key={index} className="px-4 py-2 text-gray-500">...</span>
          )
        ))}
      </div>

      <Link 
        href={`?page=${currentPage + 1}`}
        className={`px-4 py-2 rounded-lg border ${currentPage === totalPages ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
        aria-disabled={currentPage === totalPages}
        tabIndex={currentPage === totalPages ? -1 : undefined}
      >
        Next
      </Link>
    </div>
  );
} 
 