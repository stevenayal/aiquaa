'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { TechnicalInfo } from '@/types/bug';
import { collectTechnicalInfo, ConsoleLogCapture, createConsoleLogsFile } from '@/lib/techInfo';
import { ScreenRecorder } from '@/lib/recorder';
import { getBugReportQueue } from '@/lib/bugQueue';

const MAX_FILES = 5;
const MAX_TOTAL_SIZE = 25 * 1024 * 1024; // 25 MB
const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webm', 'mp4', 'txt', 'log'];

const bugReportSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120, 'Title must be 120 characters or less'),
  stepsToReproduce: z.string().min(1, 'Steps to reproduce are required'),
  expectedResult: z.string().min(1, 'Expected result is required'),
  actualResult: z.string().min(1, 'Actual result is required'),
  severity: z.enum(['Minor', 'Major', 'Critical'] as const),
  impact: z.enum(['Low', 'Medium', 'High'] as const),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must consent to include technical data',
  }),
});

type FormValues = z.infer<typeof bugReportSchema>;

type SubmissionState = 'idle' | 'loading' | 'success' | 'error';

export default function BugReportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [showTechInfo, setShowTechInfo] = useState(false);
  const [technicalInfo, setTechnicalInfo] = useState<TechnicalInfo | null>(null);
  const [includeConsoleLogs, setIncludeConsoleLogs] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const consoleCapture = useRef<ConsoleLogCapture>(new ConsoleLogCapture());
  const screenRecorder = useRef<ScreenRecorder>(new ScreenRecorder());

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(bugReportSchema),
    defaultValues: {
      title: '',
      stepsToReproduce: '',
      expectedResult: '',
      actualResult: '',
      severity: 'Minor',
      impact: 'Low',
      consent: false,
    },
  });

  // Focus management and escape key
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Tab trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    modal.addEventListener('keydown', handleTab);
    return () => modal.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  // Collect technical info when opening modal
  useEffect(() => {
    if (isOpen) {
      const currentInfo = collectTechnicalInfo();
      setTechnicalInfo(currentInfo);
    }
  }, [isOpen]);

  // Handle console log capture
  useEffect(() => {
    const capture = consoleCapture.current;

    if (includeConsoleLogs) {
      capture.start(30000);
    } else {
      capture.stop();
    }

    return () => {
      capture.stop();
    };
  }, [includeConsoleLogs]);

  // Process offline queue on mount and when coming online
  useEffect(() => {
    const processOfflineQueue = async () => {
      try {
        const queue = getBugReportQueue();
        const count = await queue.count();
        if (count > 0 && navigator.onLine) {
          // Process queue in background
          const { processQueue } = await import('@/lib/bugQueue');
          processQueue(async (payload) => {
            await submitBugReport(payload);
          });
        }
      } catch (error) {
        console.error('Failed to process offline queue:', error);
      }
    };

    processOfflineQueue();

    const handleOnline = () => {
      processOfflineQueue();
    };

    const handleFocus = () => {
      if (navigator.onLine) {
        processOfflineQueue();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleClose = useCallback(() => {
    if (submissionState === 'loading') return;

    setIsOpen(false);
    setShowTechInfo(false);
    setAttachments([]);
    setIncludeConsoleLogs(false);
    setSubmissionState('idle');
    setErrorMessage('');
    setSuccessMessage('');
    reset();

    if (isRecording) {
      screenRecorder.current.cancelRecording();
      setIsRecording(false);
    }

    consoleCapture.current.stop();
    consoleCapture.current.clear();
  }, [submissionState, reset, isRecording]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles: File[] = [];
    let totalSize = attachments.reduce((sum, file) => sum + file.size, 0);

    for (const file of newFiles) {
      // Check file count
      if (attachments.length + validFiles.length >= MAX_FILES) {
        setErrorMessage(`Maximum ${MAX_FILES} files allowed`);
        break;
      }

      // Check file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
        setErrorMessage(`Invalid file type: ${file.name}. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
        continue;
      }

      // Check total size
      if (totalSize + file.size > MAX_TOTAL_SIZE) {
        setErrorMessage(`Total file size exceeds 25 MB`);
        break;
      }

      validFiles.push(file);
      totalSize += file.size;
    }

    if (validFiles.length > 0) {
      setAttachments([...attachments, ...validFiles]);
      setErrorMessage('');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    handleFileSelect(e.dataTransfer.files);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleRecording = async () => {
    if (isRecording) {
      try {
        const file = await screenRecorder.current.stopRecording();
        setAttachments([...attachments, file]);
        setIsRecording(false);
      } catch (error) {
        setErrorMessage('Failed to save recording');
        console.error('Recording error:', error);
      }
    } else {
      try {
        await screenRecorder.current.startRecording({ includeAudio: true });
        setIsRecording(true);
      } catch (error) {
        setErrorMessage('Failed to start recording. Please grant screen sharing permission.');
        console.error('Recording error:', error);
      }
    }
  };

  const submitBugReport = async (payload: any) => {
    const formData = new FormData();

    // Add form fields
    Object.entries(payload).forEach(([key, value]) => {
      if (key !== 'attachments' && key !== 'technicalInfo') {
        formData.append(key, String(value));
      }
    });

    // Add technical info as JSON
    if (payload.technicalInfo) {
      formData.append('technicalInfo', JSON.stringify(payload.technicalInfo));
    }

    // Add attachments
    if (payload.attachments) {
      payload.attachments.forEach((file: File) => {
        formData.append('attachments', file);
      });
    }

    const response = await fetch('/api/bug-report', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit bug report');
    }

    return response.json();
  };

  const onSubmit = async (data: FormValues) => {
    setSubmissionState('loading');
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Add console logs if enabled
      const logsFile = includeConsoleLogs && consoleCapture.current.getLogs().length > 0
        ? createConsoleLogsFile(consoleCapture.current.getLogs())
        : null;

      const finalAttachments = logsFile ? [...attachments, logsFile] : [...attachments];

      const payload = {
        ...data,
        technicalInfo: data.consent && technicalInfo ? technicalInfo : undefined,
        attachments: finalAttachments,
      };

      // Try to submit
      try {
        const result = await submitBugReport(payload);

        setSubmissionState('success');
        setSuccessMessage(result.message || 'Bug report submitted successfully!');

        // Emit telemetry event
        window.dispatchEvent(
          new CustomEvent('aiquaa-bug-submitted', {
            detail: { severity: data.severity, impact: data.impact },
          })
        );

        // Close modal after 2 seconds
        setTimeout(() => {
          handleClose();
        }, 2000);
      } catch (error) {
        // If online but failed, or offline, queue for later
        if (!navigator.onLine || (error instanceof Error && error.message.includes('fetch'))) {
          const queue = getBugReportQueue();
          await queue.enqueue(payload);
          setSubmissionState('success');
          setSuccessMessage('You are offline. Bug report saved and will be submitted when you are back online.');

          setTimeout(() => {
            handleClose();
          }, 3000);
        } else {
          throw error;
        }
      }
    } catch (error) {
      setSubmissionState('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <>
      {/* FAB Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label="Report bug"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </button>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded whitespace-nowrap">
            Report bug
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bug-report-title"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleClose}
          />

          {/* Modal Content */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              ref={modalRef}
              className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <h2 id="bug-report-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                  Report a Bug
                </h2>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    {...register('title')}
                    ref={firstInputRef}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                    aria-describedby={errors.title ? 'title-error' : undefined}
                    aria-invalid={!!errors.title}
                  />
                  {errors.title && (
                    <p id="title-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Steps to Reproduce */}
                <div>
                  <label htmlFor="stepsToReproduce" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Steps to Reproduce <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="stepsToReproduce"
                    {...register('stepsToReproduce')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                    aria-describedby={errors.stepsToReproduce ? 'steps-error' : undefined}
                    aria-invalid={!!errors.stepsToReproduce}
                  />
                  {errors.stepsToReproduce && (
                    <p id="steps-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                      {errors.stepsToReproduce.message}
                    </p>
                  )}
                </div>

                {/* Expected Result */}
                <div>
                  <label htmlFor="expectedResult" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expected Result <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="expectedResult"
                    {...register('expectedResult')}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                    aria-describedby={errors.expectedResult ? 'expected-error' : undefined}
                    aria-invalid={!!errors.expectedResult}
                  />
                  {errors.expectedResult && (
                    <p id="expected-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                      {errors.expectedResult.message}
                    </p>
                  )}
                </div>

                {/* Actual Result */}
                <div>
                  <label htmlFor="actualResult" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Actual Result <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="actualResult"
                    {...register('actualResult')}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                    aria-describedby={errors.actualResult ? 'actual-error' : undefined}
                    aria-invalid={!!errors.actualResult}
                  />
                  {errors.actualResult && (
                    <p id="actual-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                      {errors.actualResult.message}
                    </p>
                  )}
                </div>

                {/* Severity and Impact */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="severity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Severity <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="severity"
                      {...register('severity')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Minor">Minor</option>
                      <option value="Major">Major</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="impact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Impact <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="impact"
                      {...register('impact')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Attachments (Optional)
                  </label>

                  {/* Recording Button */}
                  {ScreenRecorder.isSupported() && (
                    <button
                      type="button"
                      onClick={handleRecording}
                      className={`mb-2 px-4 py-2 rounded-md text-sm font-medium ${
                        isRecording
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-red-500`}
                    >
                      {isRecording ? (
                        <>
                          <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse mr-2"></span>
                          Stop Recording
                        </>
                      ) : (
                        'Record Screen/Voice'
                      )}
                    </button>
                  )}

                  {/* Drag and Drop Area */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-md p-4 text-center ${
                      dragActive
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".png,.jpg,.jpeg,.webm,.mp4,.txt,.log"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                      id="file-input"
                    />
                    <label
                      htmlFor="file-input"
                      className="cursor-pointer text-sm text-gray-600 dark:text-gray-400"
                    >
                      Drag and drop files here, or{' '}
                      <span className="text-red-600 dark:text-red-400 underline">browse</span>
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Max {MAX_FILES} files, 25 MB total. Accepted: {ALLOWED_EXTENSIONS.join(', ')}
                    </p>
                  </div>

                  {/* File List */}
                  {attachments.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {attachments.map((file, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded"
                        >
                          <span className="truncate text-gray-700 dark:text-gray-300">
                            {file.name} ({formatBytes(file.size)})
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="ml-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 focus:outline-none"
                            aria-label={`Remove ${file.name}`}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Technical Data Collapsible */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-md">
                  <button
                    type="button"
                    onClick={() => setShowTechInfo(!showTechInfo)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-expanded={showTechInfo}
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Technical Data (Auto-collected)
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${showTechInfo ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showTechInfo && technicalInfo && (
                    <div className="px-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                      <dl className="mt-2 space-y-1 text-xs">
                        <div className="grid grid-cols-3 gap-2">
                          <dt className="font-medium text-gray-600 dark:text-gray-400">URL:</dt>
                          <dd className="col-span-2 text-gray-900 dark:text-gray-200 truncate">{technicalInfo.url}</dd>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <dt className="font-medium text-gray-600 dark:text-gray-400">User Agent:</dt>
                          <dd className="col-span-2 text-gray-900 dark:text-gray-200 break-all">{technicalInfo.userAgent}</dd>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <dt className="font-medium text-gray-600 dark:text-gray-400">Viewport:</dt>
                          <dd className="col-span-2 text-gray-900 dark:text-gray-200">
                            {technicalInfo.viewport.width} x {technicalInfo.viewport.height}
                          </dd>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <dt className="font-medium text-gray-600 dark:text-gray-400">Timezone:</dt>
                          <dd className="col-span-2 text-gray-900 dark:text-gray-200">{technicalInfo.timezone}</dd>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <dt className="font-medium text-gray-600 dark:text-gray-400">Language:</dt>
                          <dd className="col-span-2 text-gray-900 dark:text-gray-200">{technicalInfo.language}</dd>
                        </div>
                        {technicalInfo.deviceMemory && (
                          <div className="grid grid-cols-3 gap-2">
                            <dt className="font-medium text-gray-600 dark:text-gray-400">Memory:</dt>
                            <dd className="col-span-2 text-gray-900 dark:text-gray-200">{technicalInfo.deviceMemory} GB</dd>
                          </div>
                        )}
                      </dl>

                      {/* Console Logs Toggle */}
                      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeConsoleLogs}
                            onChange={(e) => setIncludeConsoleLogs(e.target.checked)}
                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            Include console logs (captures errors/warnings for 30s)
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Consent Checkbox */}
                <div>
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('consent')}
                      className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      aria-describedby={errors.consent ? 'consent-error' : undefined}
                      aria-invalid={!!errors.consent}
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      I consent to auto-include technical data (URL, browser, OS, viewport, timezone) to help diagnose this bug <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.consent && (
                    <p id="consent-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                      {errors.consent.message}
                    </p>
                  )}
                </div>

                {/* Error/Success Messages */}
                {errorMessage && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md" role="alert">
                    <p className="text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md" role="status">
                    <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submissionState === 'loading' || submissionState === 'success'}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  >
                    {submissionState === 'loading' ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Submitting...
                      </span>
                    ) : submissionState === 'success' ? (
                      'Submitted!'
                    ) : (
                      'Submit Bug Report'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={submissionState === 'loading'}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
