import '@testing-library/jest-dom';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { migrateFiles, verifyMigration, rollbackMigration } from '../storageMigration';
import { supabase } from '../supabaseClient';

// Mock Supabase client
jest.mock('../supabaseClient', () => ({
  supabase: {
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
        remove: jest.fn(),
      })),
    },
  },
}));

// Mock fetch for Firebase file download
global.fetch = jest.fn();

describe('Storage Migration Utility', () => {
  // Test data
  const mockFirebaseUrls = [
    'https://firebasestorage.googleapis.com/v0/b/test-bucket/profile-pictures/user1.jpg',
    'https://firebasestorage.googleapis.com/v0/b/test-bucket/organization-logos/org1.png',
    'https://firebasestorage.googleapis.com/v0/b/test-bucket/project-files/doc1.pdf',
  ];

  const mockFileContent = new Blob(['test content'], { type: 'image/jpeg' });
  const mockProgressCallback = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockFileContent),
    });
  });

  describe('migrateFiles', () => {
    it('should successfully migrate multiple files', async () => {
      // Mock successful upload
      (supabase.storage.from('public').upload as jest.Mock).mockResolvedValue({
        error: null,
        data: { path: 'test/path' },
      });

      const results = await migrateFiles(
        mockFirebaseUrls,
        'profile-pictures',
        mockProgressCallback
      );

      expect(results).toHaveLength(mockFirebaseUrls.length);
      expect(results.every(r => r.success)).toBe(true);
      expect(mockProgressCallback).toHaveBeenCalledTimes(mockFirebaseUrls.length * 2);
    });

    it('should handle failed file downloads', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Download failed'));

      const results = await migrateFiles(
        [mockFirebaseUrls[0]],
        'profile-pictures',
        mockProgressCallback
      );

      expect(results[0].success).toBe(false);
      expect(results[0].error).toContain('Download failed');
    });

    it('should handle failed uploads', async () => {
      (supabase.storage.from('public').upload as jest.Mock).mockResolvedValue({
        error: { message: 'Upload failed' },
      });

      const results = await migrateFiles(
        [mockFirebaseUrls[0]],
        'profile-pictures',
        mockProgressCallback
      );

      expect(results[0].success).toBe(false);
      expect(results[0].error).toContain('Upload failed');
    });
  });

  describe('verifyMigration', () => {
    it('should verify successful migrations', async () => {
      const mockResults = [
        {
          success: true,
          originalPath: mockFirebaseUrls[0],
          newPath: 'test/path/file1.jpg',
        },
      ];

      (supabase.storage.from('public').getPublicUrl as jest.Mock).mockResolvedValue({
        data: { publicUrl: 'https://test.com/file1.jpg' },
      });

      const { verified, failed } = await verifyMigration(mockResults);

      expect(verified).toHaveLength(1);
      expect(failed).toHaveLength(0);
    });

    it('should identify failed verifications', async () => {
      const mockResults = [
        {
          success: true,
          originalPath: mockFirebaseUrls[0],
          newPath: 'test/path/file1.jpg',
        },
      ];

      (supabase.storage.from('public').getPublicUrl as jest.Mock).mockResolvedValue({
        data: { publicUrl: null },
      });

      const { verified, failed } = await verifyMigration(mockResults);

      expect(verified).toHaveLength(0);
      expect(failed).toHaveLength(1);
    });
  });

  describe('rollbackMigration', () => {
    it('should successfully rollback migrations', async () => {
      const mockResults = [
        {
          success: true,
          originalPath: mockFirebaseUrls[0],
          newPath: 'test/path/file1.jpg',
        },
      ];

      (supabase.storage.from('public').remove as jest.Mock).mockResolvedValue({
        error: null,
      });

      const result = await rollbackMigration(mockResults);

      expect(result.success).toBe(true);
      expect(supabase.storage.from('public').remove).toHaveBeenCalledWith(['test/path/file1.jpg']);
    });

    it('should handle rollback failures', async () => {
      const mockResults = [
        {
          success: true,
          originalPath: mockFirebaseUrls[0],
          newPath: 'test/path/file1.jpg',
        },
      ];

      (supabase.storage.from('public').remove as jest.Mock).mockResolvedValue({
        error: { message: 'Rollback failed' },
      });

      const result = await rollbackMigration(mockResults);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Rollback failed');
    });
  });
}); 