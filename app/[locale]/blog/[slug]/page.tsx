import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';

// Consistent UK date formatting function
function formatUKDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug, published: true },
  });
  return post;
}

export default async function BlogPostPage({ params }: { params: { slug: string, locale: string } }) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  const sanitizedContent = DOMPurify.sanitize(post.content);

  return (
    <div className="apple-blog-post">
      {/* Clean Hero Image - Apple/Nike Style */}
      <div className="relative w-full h-[60vh] min-h-[400px] bg-gray-100">
        {post.imageUrl && (
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      {/* Article Content - Text Below Image */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm font-medium">
            <Link href={`/${params.locale}`} className="text-gray-500 hover:text-black transition-colors">
              Home
            </Link>
            <span className="mx-2 text-gray-300">›</span>
            <Link href={`/${params.locale}/blog`} className="text-gray-500 hover:text-black transition-colors">
              Blog
            </Link>
            <span className="mx-2 text-gray-300">›</span>
            <span className="text-black">{post.title}</span>
          </nav>

          {/* Article Header - Apple Style */}
          <header className="mb-12 space-y-6">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {formatUKDate(new Date(post.createdAt))}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight tracking-tight apple-heading">
              {post.title}
            </h1>
            
            {post.summary && (
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-light max-w-3xl apple-text">
                {post.summary}
              </p>
            )}

            <div className="flex items-center space-x-6 pt-4">
              <div className="text-sm text-gray-500">
                Last updated: {formatUKDate(new Date(post.updatedAt))}
              </div>
              <div className="flex space-x-4">
                <button className="text-black hover:text-gray-600 transition-colors text-sm font-medium">
                  Share
                </button>
                <button className="text-black hover:text-gray-600 transition-colors text-sm font-medium">
                  Print
                </button>
              </div>
            </div>
          </header>

          {/* Article Body - Clean Typography */}
          <article className="prose prose-xl max-w-none apple-prose">
            <div 
              className="prose-headings:font-bold prose-headings:text-black prose-headings:tracking-tight prose-p:text-gray-700 prose-p:leading-relaxed prose-p:font-light prose-a:text-black prose-a:underline hover:prose-a:text-gray-600 prose-strong:text-black prose-img:rounded-xl prose-img:shadow-lg prose-blockquote:border-l-black prose-blockquote:text-gray-700"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </article>

          {/* Back to Blog - Apple Style Button */}
          <div className="mt-16 pt-12 border-t border-gray-200 text-center">
            <Link 
              href={`/${params.locale}/blog`}
              className="inline-flex items-center px-8 py-4 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300 font-medium text-sm tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to All Articles
            </Link>
          </div>
        </div>
      </div>

      {/* Related Articles Section - Clean Style */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-black mb-6 tracking-tight apple-heading">
            More Articles
          </h2>
          <p className="text-gray-600 text-lg font-light mb-8 apple-text">
            Related articles will appear here soon!
          </p>
          <Link 
            href={`/${params.locale}/blog`}
            className="inline-flex items-center text-black hover:text-gray-600 transition-colors font-medium"
          >
            Browse all articles 
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
} 
 