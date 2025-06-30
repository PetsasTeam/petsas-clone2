import { prisma } from '@/lib/prisma';
import BlogForm from '../../BlogForm';
import { updatePost } from '../../actions';
import { notFound } from 'next/navigation';

interface EditPostPageProps {
  params: {
    id: string;
  };
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
  });

  if (!post) {
    notFound();
  }

  // Create action that includes the post ID
  const updatePostWithId = async (formData: FormData) => {
    'use server';
    formData.set('id', post.id);
    return updatePost(formData);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Blog Post</h1>
        <p className="text-gray-600 mt-1">Update your multilingual blog content</p>
      </div>
      <BlogForm action={updatePostWithId} post={post} />
    </div>
  );
} 
 