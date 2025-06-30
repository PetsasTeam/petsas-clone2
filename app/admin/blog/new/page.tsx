import BlogForm from '../BlogForm';
import { createPost } from '../actions';

export default function NewPostPage() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Post</h1>
      <BlogForm action={createPost} />
    </div>
  );
} 