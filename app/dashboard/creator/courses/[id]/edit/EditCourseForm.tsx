'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FileUploader from '@/components/FileUploader';

type ContentType = 'TEXT' | 'VIDEO' | 'PDF';

interface Section {
  id: string;
  title: string;
  contentType: ContentType;
  content: string;
  videoUrl?: string | null;
  videoThumbnailUrl?: string | null;
  pdfUrl?: string | null;
  order: number;
  minTimeSeconds: number;
  questions?: Question[];
}

interface Question {
  id: string;
  sectionId?: string | null;
  questionText: string;
  context?: string | null;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  cpdHours: number;
  thumbnail: string | null;
  sections: Section[];
}

const CATEGORIES = [
  'Clinical Practice',
  'Medical Research',
  'Healthcare Management',
  'Public Health',
  'Medical Ethics',
  'Technology in Medicine',
  'Patient Care',
  'Professional Development',
];

export default function EditCourseForm({ course }: { course: Course }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract all questions from sections
  const allQuestions: Question[] = course.sections.flatMap(section =>
    (section.questions || []).map(q => ({ ...q, sectionId: section.id } as Question))
  );

  const [formData, setFormData] = useState({
    title: course.title,
    slug: course.slug,
    category: course.categoryId,
    description: course.description,
    difficulty: course.difficulty,
    cpdHours: course.cpdHours,
    thumbnailUrl: course.thumbnail || '',
    sections: course.sections,
    questions: allQuestions,
  });

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: '',
      contentType: 'TEXT',
      content: '',
      order: formData.sections.length + 1,
      minTimeSeconds: 60,
    };
    setFormData({
      ...formData,
      sections: [...formData.sections, newSection],
    });
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    setFormData({
      ...formData,
      sections: formData.sections.map(section =>
        section.id === id ? { ...section, ...updates } : section
      ),
    });
  };

  const deleteSection = (id: string) => {
    setFormData({
      ...formData,
      sections: formData.sections.filter(section => section.id !== id),
    });
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      sectionId: null,
      questionText: '',
      context: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      explanation: '',
    };
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    });
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setFormData({
      ...formData,
      questions: formData.questions.map(question =>
        question.id === id ? { ...question, ...updates } : question
      ),
    });
  };

  const deleteQuestion = (id: string) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter(question => question.id !== id),
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/creator/courses/${course.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update course');
      }

      router.push('/dashboard/creator/courses');
    } catch (err) {
      console.error('Update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update course');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <h2 className="text-xl font-semibold">Basic Information</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug (auto-generated)
          </label>
          <input
            type="text"
            value={formData.slug}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty *
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CPD Hours *
            </label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={formData.cpdHours}
              onChange={(e) => setFormData({ ...formData, cpdHours: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {formData.thumbnailUrl && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Thumbnail
            </label>
            <img
              src={formData.thumbnailUrl}
              alt="Course thumbnail"
              className="w-48 h-32 object-cover rounded-lg"
            />
          </div>
        )}

        <FileUploader
          acceptedTypes="image/*"
          maxSize={5}
          label="Update Thumbnail"
          onUploadComplete={(data) => setFormData({ ...formData, thumbnailUrl: data.url })}
        />
      </div>

      {/* Sections */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Course Sections</h2>
          <button
            onClick={addSection}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Section
          </button>
        </div>

        <div className="space-y-6">
          {formData.sections.map((section, index) => (
            <div key={section.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold">Section {index + 1}</h3>
                <button
                  onClick={() => deleteSection(section.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type
                  </label>
                  <select
                    value={section.contentType}
                    onChange={(e) => updateSection(section.id, { contentType: e.target.value as ContentType })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="TEXT">Text</option>
                    <option value="VIDEO">Video</option>
                    <option value="PDF">PDF</option>
                  </select>
                </div>

                {section.contentType === 'TEXT' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      value={section.content}
                      onChange={(e) => updateSection(section.id, { content: e.target.value })}
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                )}

                {section.contentType === 'VIDEO' && (
                  <>
                    <FileUploader
                      acceptedTypes="video/*"
                      maxSize={500}
                      label="Upload Video"
                      onUploadComplete={(data) => updateSection(section.id, { videoUrl: data.url, content: data.url })}
                    />
                    <FileUploader
                      acceptedTypes="image/*"
                      maxSize={5}
                      label="Video Thumbnail"
                      onUploadComplete={(data) => updateSection(section.id, { videoThumbnailUrl: data.url })}
                    />
                  </>
                )}

                {section.contentType === 'PDF' && (
                  <FileUploader
                    acceptedTypes=".pdf,application/pdf"
                    maxSize={50}
                    label="Upload PDF"
                    onUploadComplete={(data) => updateSection(section.id, { pdfUrl: data.url, content: data.url })}
                  />
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Time (seconds)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={section.minTimeSeconds}
                    onChange={(e) => updateSection(section.id, { minTimeSeconds: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Quiz Questions</h2>
          <button
            onClick={addQuestion}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Question
          </button>
        </div>

        <div className="space-y-6">
          {formData.questions.map((question, index) => (
            <div key={question.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold">Question {index + 1}</h3>
                <button
                  onClick={() => deleteQuestion(question.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text
                  </label>
                  <textarea
                    value={question.questionText}
                    onChange={(e) => updateQuestion(question.id, { questionText: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option A
                    </label>
                    <input
                      type="text"
                      value={question.optionA}
                      onChange={(e) => updateQuestion(question.id, { optionA: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option B
                    </label>
                    <input
                      type="text"
                      value={question.optionB}
                      onChange={(e) => updateQuestion(question.id, { optionB: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option C
                    </label>
                    <input
                      type="text"
                      value={question.optionC}
                      onChange={(e) => updateQuestion(question.id, { optionC: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option D
                    </label>
                    <input
                      type="text"
                      value={question.optionD}
                      onChange={(e) => updateQuestion(question.id, { optionD: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer
                  </label>
                  <select
                    value={question.correctAnswer}
                    onChange={(e) => updateQuestion(question.id, { correctAnswer: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Explanation
                  </label>
                  <textarea
                    value={question.explanation}
                    onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
