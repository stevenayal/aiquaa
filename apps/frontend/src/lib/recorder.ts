/**
 * Screen and voice recorder using MediaRecorder API
 */
export class ScreenRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;

  /**
   * Check if screen recording is supported
   */
  static isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  }

  /**
   * Start recording screen with optional audio
   */
  async startRecording(options: {
    includeAudio?: boolean;
    mimeType?: string;
  } = {}): Promise<void> {
    const { includeAudio = true, mimeType = 'video/webm;codecs=vp8,opus' } = options;

    try {
      // Request screen capture
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',
        } as MediaTrackConstraints,
        audio: includeAudio,
      });

      // Optionally add microphone audio
      let audioStream: MediaStream | null = null;
      if (includeAudio) {
        try {
          audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });
        } catch (error) {
          console.warn('Microphone access denied, continuing without audio:', error);
        }
      }

      // Combine tracks
      const tracks: MediaStreamTrack[] = [...displayStream.getVideoTracks()];

      if (displayStream.getAudioTracks().length > 0) {
        tracks.push(...displayStream.getAudioTracks());
      }

      if (audioStream) {
        tracks.push(...audioStream.getAudioTracks());
      }

      this.stream = new MediaStream(tracks);

      // Determine best supported mime type
      const supportedMimeType = this.getSupportedMimeType(mimeType);

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: supportedMimeType,
      });

      this.chunks = [];

      // Handle data available
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      // Handle stream ending (user stopped sharing)
      this.stream.getVideoTracks()[0].addEventListener('ended', () => {
        this.stopRecording();
      });

      // Start recording
      this.mediaRecorder.start(100); // Collect data every 100ms
    } catch (error) {
      this.cleanup();
      throw new Error(`Failed to start recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stop recording and return the recorded file
   */
  async stopRecording(): Promise<File> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      if (this.mediaRecorder.state === 'inactive') {
        reject(new Error('Recording already stopped'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        try {
          const blob = new Blob(this.chunks, { type: 'video/webm' });
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const file = new File([blob], `screen-recording-${timestamp}.webm`, {
            type: 'video/webm',
          });

          this.cleanup();
          resolve(file);
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Cancel recording without saving
   */
  cancelRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.cleanup();
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  /**
   * Get recording duration in milliseconds
   */
  getRecordingDuration(): number {
    if (!this.mediaRecorder || !this.chunks.length) {
      return 0;
    }
    return this.chunks.reduce((sum, chunk) => sum + chunk.size, 0);
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.chunks = [];
  }

  /**
   * Get supported MIME type from preferred list
   */
  private getSupportedMimeType(preferred: string): string {
    const mimeTypes = [
      preferred,
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4',
    ];

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }
    }

    return 'video/webm'; // Fallback
  }
}

/**
 * Voice-only recorder using MediaRecorder API
 */
export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;

  /**
   * Check if voice recording is supported
   */
  static isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /**
   * Start recording audio
   */
  async startRecording(mimeType: string = 'audio/webm;codecs=opus'): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      const supportedMimeType = this.getSupportedMimeType(mimeType);

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: supportedMimeType,
      });

      this.chunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100);
    } catch (error) {
      this.cleanup();
      throw new Error(`Failed to start audio recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stop recording and return the recorded file
   */
  async stopRecording(): Promise<File> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      if (this.mediaRecorder.state === 'inactive') {
        reject(new Error('Recording already stopped'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        try {
          const blob = new Blob(this.chunks, { type: 'audio/webm' });
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const file = new File([blob], `voice-recording-${timestamp}.webm`, {
            type: 'audio/webm',
          });

          this.cleanup();
          resolve(file);
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Cancel recording without saving
   */
  cancelRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.cleanup();
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.chunks = [];
  }

  /**
   * Get supported MIME type from preferred list
   */
  private getSupportedMimeType(preferred: string): string {
    const mimeTypes = [
      preferred,
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }
    }

    return 'audio/webm'; // Fallback
  }
}
