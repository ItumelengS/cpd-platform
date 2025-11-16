'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function CreatorApplicationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    motivation: '',
    expertise: '',
    experience: '',
    sampleContent: '',
    cvFile: null as File | null,
  });

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/creator/apply');
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('CV file must be less than 5MB');
        return;
      }
      // Validate file type
      if (!file.type.includes('pdf') && !file.type.includes('word')) {
        setError('CV must be a PDF or Word document');
        return;
      }
      setFormData({ ...formData, cvFile: file });
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert file to base64 for now (will use proper storage in Task 14)
      let cvDataUrl = '';
      if (formData.cvFile) {
        const reader = new FileReader();
        cvDataUrl = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(formData.cvFile!);
        });
      }

      const response = await fetch('/api/creator/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          motivation: formData.motivation,
          expertise: formData.expertise,
          experience: formData.experience,
          sampleContent: formData.sampleContent,
          cvUrl: cvDataUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      // Success! Redirect to dashboard with success message
      router.push('/dashboard?message=application-submitted');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Apply to Become a Creator
          </h1>
          <p className="text-gray-600 mb-8">
            Share your expertise with healthcare professionals worldwide. We'll review your application within 3 business days.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Motivation */}
            <div>
              <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 mb-2">
                Why do you want to be a creator? <span className="text-red-500">*</span>
              </label>
              <textarea
                id="motivation"
                required
                rows={4}
                value={formData.motivation}
                onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us why you want to create content on our platform..."
              />
            </div>

            {/* Expertise */}
            <div>
              <label htmlFor="expertise" className="block text-sm font-medium text-gray-700 mb-2">
                What is your area of expertise? <span className="text-red-500">*</span>
              </label>
              <textarea
                id="expertise"
                required
                rows={4}
                value={formData.expertise}
                onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your areas of expertise (e.g., Radiology, Cardiology, Medical Education)..."
              />
            </div>

            {/* Experience */}
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                Teaching or content creation experience <span className="text-red-500">*</span>
              </label>
              <textarea
                id="experience"
                required
                rows={4}
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Share your teaching, training, or content creation experience..."
              />
            </div>

            {/* Sample Content */}
            <div>
              <label htmlFor="sampleContent" className="block text-sm font-medium text-gray-700 mb-2">
                Link to sample work (optional)
              </label>
              <input
                type="url"
                id="sampleContent"
                value={formData.sampleContent}
                onChange={(e) => setFormData({ ...formData, sampleContent: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/your-work"
              />
              <p className="mt-1 text-sm text-gray-500">
                Share a link to your publications, courses, or other relevant work
              </p>
            </div>

            {/* CV Upload */}
            <div>
              <label htmlFor="cv" className="block text-sm font-medium text-gray-700 mb-2">
                Upload CV/Resume <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                id="cv"
                required
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                PDF or Word document, max 5MB
              </p>
              {formData.cvFile && (
                <p className="mt-2 text-sm text-green-600">
                  ✓ {formData.cvFile.name} ({(formData.cvFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
