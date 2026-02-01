import React, { useRef, useEffect } from 'react';
import { Download, Printer, ArrowLeft } from 'lucide-react';
import apiService from '../services/api';

interface ResumeOutputProps {
  htmlContent: string;
  pdfUrl?: string | null;
  onBack: () => void;
}

const ResumeOutput: React.FC<ResumeOutputProps> = ({ htmlContent, pdfUrl, onBack }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Set the HTML content to the iframe when it changes
    if (iframeRef.current && htmlContent) {
      const iframeDoc = iframeRef.current.contentDocument || 
                       (iframeRef.current.contentWindow?.document);
      
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();
      }
    }
  }, [htmlContent]);

  const handlePrint = () => {
    // Use the server-generated PDF for printing if available
    if (pdfUrl) {
      // Open the PDF in a new window and trigger print
      const printWindow = window.open(apiService.getDownloadUrl("optimized_resume.pdf"), '_blank');
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
    } else {
      // Fallback to iframe printing if no PDF is available
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.print();
      }
    }
  };

  const handleDownloadPdf = () => {
    // Use the server-generated PDF URL if available
    if (pdfUrl) {
      // Create a direct link to the PDF
      window.open(apiService.getDownloadUrl("optimized_resume.pdf"), '_blank');
    } else {
      // If no PDF URL is available, inform the user
      alert('PDF download is not available. Please try generating the resume again.');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-between items-center">
          <button 
            onClick={onBack}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Back to Editor</span>
          </button>
          
          <div className="flex space-x-3">
            <button 
              onClick={handlePrint}
              className="flex items-center bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Printer className="w-5 h-5 mr-2" />
              <span>Print</span>
            </button>
            
            <button
              onClick={handleDownloadPdf}
              className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
              disabled={!pdfUrl}
              aria-disabled={!pdfUrl}
            >
              <Download className="w-5 h-5 mr-2" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
        
        {/* Resume Preview */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Optimized Resume</h2>
          
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-2 mb-4">
            <p className="text-gray-600 text-sm">
              This resume has been tailored to match the job posting you provided, 
              highlighting relevant skills and experience.
            </p>
          </div>
          
          <div className="resume-preview border border-gray-200 rounded-lg overflow-hidden">
            <iframe
              ref={iframeRef}
              title="Resume Preview"
              className="w-full h-[800px]"
              sandbox="allow-same-origin allow-modals allow-scripts"
            />
          </div>
        </div>
        
        {/* Tips */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Next Steps</h3>
          
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="bg-indigo-100 text-indigo-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">1</span>
              <span>Review your optimized resume for accuracy and make any final adjustments.</span>
            </li>
            <li className="flex items-start">
              <span className="bg-indigo-100 text-indigo-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">2</span>
              <span>Download the PDF version for submission, or print a hard copy if needed.</span>
            </li>
            <li className="flex items-start">
              <span className="bg-indigo-100 text-indigo-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">3</span>
              <span>Consider creating a matching cover letter that complements your optimized resume.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResumeOutput;