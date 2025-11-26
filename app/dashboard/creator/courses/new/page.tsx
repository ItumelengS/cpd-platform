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
  videoUrl?: string;
  videoThumbnailUrl?: string;
  pdfUrl?: string;
  order: number;
  minTimeSeconds: number;
}

interface Question {
  id: string;
  sectionId?: string;
  questionText: string;
  context?: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

interface CourseFormData {
  title: string;
  slug: string;
  category: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  cpdHours: number;
  cpdContentType: 'CLINICAL' | 'ETHICS_HUMAN_RIGHTS_LAW';
  thumbnailUrl: string;
  sections: Section[];
  questions: Question[];
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

export default function NewCoursePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    slug: '',
    category: '',
    description: '',
    difficulty: 'BEGINNER',
    cpdHours: 1,
    cpdContentType: 'CLINICAL',
    thumbnailUrl: '',
    sections: [],
    questions: [],
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

  const addQuestion = (sectionId?: string) => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      sectionId,
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

  const handleSubmit = async (isDraft: boolean) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/creator/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          isDraft,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create course');
      }

      const data = await response.json();
      router.push(`/dashboard/creator/courses`);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToNextStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(
          formData.title &&
          formData.category &&
          formData.description &&
          formData.thumbnailUrl
        );
      case 2:
        return formData.sections.length > 0 && formData.sections.every(s => s.title && s.content);
      case 3:
        return formData.questions.length > 0 && formData.questions.every(q =>
          q.questionText && q.optionA && q.optionB && q.optionC && q.optionD && q.explanation
        );
      default:
        return true;
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Course</h1>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
                `}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={`
                    flex-1 h-1 mx-2
                    ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm">Basic Info</span>
          <span className="text-sm">Sections</span>
          <span className="text-sm">Questions</span>
          <span className="text-sm">Preview</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Step 1: Basic Info */}
      {currentStep === 1 && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter course title"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your course..."
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CPD Content Type * (HPCSA Compliance)
            </label>
            <select
              value={formData.cpdContentType}
              onChange={(e) => setFormData({ ...formData, cpdContentType: e.target.value as 'CLINICAL' | 'ETHICS_HUMAN_RIGHTS_LAW' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="CLINICAL">Clinical / Professional Content</option>
              <option value="ETHICS_HUMAN_RIGHTS_LAW">Ethics, Human Rights, or Health Law</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select the primary content type as per HPCSA December 2024 guidelines
            </p>
          </div>

          <FileUploader
            acceptedTypes="image/*"
            maxSize={5}
            label="Course Thumbnail *"
            onUploadComplete={(data) => setFormData({ ...formData, thumbnailUrl: data.url })}
          />
        </div>
      )}

      {/* Step 2: Add Sections */}
      {currentStep === 2 && (
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
                      placeholder="Enter section title"
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
                        placeholder="Enter section content..."
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

            {formData.sections.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No sections added yet. Click "Add Section" to get started.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Add Questions */}
      {currentStep === 3 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Quiz Questions</h2>
            <button
              onClick={() => addQuestion()}
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
                      Section (Optional)
                    </label>
                    <select
                      value={question.sectionId || ''}
                      onChange={(e) => updateQuestion(question.id, { sectionId: e.target.value || undefined })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Final Quiz</option>
                      {formData.sections.map((section, idx) => (
                        <option key={section.id} value={section.id}>
                          Section {idx + 1}: {section.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text
                    </label>
                    <textarea
                      value={question.questionText}
                      onChange={(e) => updateQuestion(question.id, { questionText: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter question..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Context (Optional)
                    </label>
                    <textarea
                      value={question.context || ''}
                      onChange={(e) => updateQuestion(question.id, { context: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Provide context for the question..."
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
                      placeholder="Explain why this is the correct answer..."
                    />
                  </div>
                </div>
              </div>
            ))}

            {formData.questions.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No questions added yet. Click "Add Question" to get started.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Preview & Submit */}
      {currentStep === 4 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Preview & Submit</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">Course Details</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Title</dt>
                  <dd className="mt-1">{formData.title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Category</dt>
                  <dd className="mt-1">{formData.category}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Difficulty</dt>
                  <dd className="mt-1">{formData.difficulty}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">CPD Hours</dt>
                  <dd className="mt-1">{formData.cpdHours}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-500">CPD Content Type</dt>
                  <dd className="mt-1">
                    {formData.cpdContentType === 'CLINICAL' ? 'Clinical / Professional Content' : 'Ethics, Human Rights, or Health Law'}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1">{formData.description}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Sections</h3>
              <p className="text-gray-600">{formData.sections.length} sections</p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Questions</h3>
              <p className="text-gray-600">{formData.questions.length} questions</p>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Submit for Review
            </button>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
          disabled={currentStep === 4 || !canProceedToNextStep()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
