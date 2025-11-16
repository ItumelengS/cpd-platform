'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DMCAReportForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    reporterName: '',
    reporterEmail: '',
    reporterAddress: '',
    copyrightOwner: '',
    workDescription: '',
    infringingUrl: '',
    goodFaithStatement: false,
    accuracyStatement: false,
    signature: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/legal/dmca/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit DMCA report');
      }

      alert('DMCA notice submitted successfully. We will review it within 7 business days.');
      router.push('/legal/dmca');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">File a DMCA Takedown Notice</h1>
          <p className="text-gray-600">
            Use this form to report copyright infringement on the CPD Platform.
          </p>
          <p className="text-gray-600 mt-2">
            <Link href="/legal/dmca" className="text-blue-600 hover:underline">
              Read our DMCA Policy
            </Link>
          </p>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 mb-8 rounded-r-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Important Legal Notice</h3>
          <p className="text-gray-700 text-sm">
            Filing a false or fraudulent DMCA notice may result in legal liability under Section 512(f) of the DMCA.
            Please ensure you have a valid copyright claim before submitting this form. If you are unsure, consult
            with a legal professional.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reporter Information */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Information</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="reporterName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    id="reporterName"
                    name="reporterName"
                    required
                    value={formData.reporterName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="reporterEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="reporterEmail"
                    name="reporterEmail"
                    required
                    value={formData.reporterEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="reporterAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    Mailing Address *
                  </label>
                  <textarea
                    id="reporterAddress"
                    name="reporterAddress"
                    required
                    rows={3}
                    value={formData.reporterAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Street address, city, state/province, postal code, country"
                  />
                </div>

                <div>
                  <label htmlFor="copyrightOwner" className="block text-sm font-medium text-gray-700 mb-1">
                    Copyright Owner (if different from you)
                  </label>
                  <input
                    type="text"
                    id="copyrightOwner"
                    name="copyrightOwner"
                    value={formData.copyrightOwner}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Leave blank if you are the copyright owner"
                  />
                </div>
              </div>
            </div>

            {/* Copyright Work Information */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Copyrighted Work</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="workDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description of Copyrighted Work *
                  </label>
                  <textarea
                    id="workDescription"
                    name="workDescription"
                    required
                    rows={4}
                    value={formData.workDescription}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Provide a detailed description of the copyrighted work that you claim has been infringed. Include information about where the original or authorized version can be found."
                  />
                </div>

                <div>
                  <label htmlFor="infringingUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    URL of Infringing Material *
                  </label>
                  <input
                    type="url"
                    id="infringingUrl"
                    name="infringingUrl"
                    required
                    value={formData.infringingUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://cpdplatform.com/..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Provide the exact URL where the allegedly infringing material appears on our platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Statements */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Required Statements</h2>

              <div className="space-y-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="goodFaithStatement"
                    name="goodFaithStatement"
                    required
                    checked={formData.goodFaithStatement}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="goodFaithStatement" className="ml-3 text-sm text-gray-700">
                    I have a good faith belief that the disputed use is not authorized by the copyright owner,
                    its agent, or the law. *
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="accuracyStatement"
                    name="accuracyStatement"
                    required
                    checked={formData.accuracyStatement}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="accuracyStatement" className="ml-3 text-sm text-gray-700">
                    Under penalty of perjury, the information in this notice is accurate and I am the copyright
                    owner or authorized to act on behalf of the copyright owner. *
                  </label>
                </div>
              </div>
            </div>

            {/* Signature */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Signature</h2>

              <div>
                <label htmlFor="signature" className="block text-sm font-medium text-gray-700 mb-1">
                  Electronic Signature *
                </label>
                <input
                  type="text"
                  id="signature"
                  name="signature"
                  required
                  value={formData.signature}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your full legal name"
                />
                <p className="text-sm text-gray-500 mt-1">
                  By typing your name, you are providing an electronic signature that has the same legal effect
                  as a handwritten signature.
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-medium"
              >
                {loading ? 'Submitting...' : 'Submit DMCA Notice'}
              </button>
              <Link
                href="/legal/dmca"
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">What Happens Next?</h3>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
            <li>We will review your DMCA notice within 7 business days</li>
            <li>If valid, we will remove or disable access to the allegedly infringing material</li>
            <li>We will notify the content creator and provide them with a copy of your notice</li>
            <li>The creator may file a counter-notice if they believe the content was removed in error</li>
            <li>You will be notified of the outcome via email</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
