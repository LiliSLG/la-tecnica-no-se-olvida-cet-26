import { Firestore, Query, CollectionReference, DocumentData } from 'firebase-admin/firestore';
import { ServiceResult, ServiceError } from '../../types/service';

export interface ExtractionOptions {
  batchSize?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export interface ExtractionProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  errors: Array<{
    id: string;
    error: any;
  }>;
}

export class FirebaseExtractor {
  private firestore: Firestore;
  private progress: ExtractionProgress;
  private options: Required<ExtractionOptions>;

  constructor(
    firestore: Firestore,
    options: ExtractionOptions = {}
  ) {
    this.firestore = firestore;
    this.progress = {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: []
    };
    this.options = {
      batchSize: options.batchSize || 100,
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000
    };
  }

  private logProgress(message: string): void {
    console.log(`[FirebaseExtractor] ${message}`);
  }

  private logError(id: string, error: any): void {
    console.error(`[FirebaseExtractor] Error extracting ${id}:`, error);
    this.progress.errors.push({ id, error });
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retry<T>(
    operation: () => Promise<T>,
    retries: number = this.options.maxRetries
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        await this.sleep(this.options.retryDelay);
        return this.retry(operation, retries - 1);
      }
      throw error;
    }
  }

  public async extractCollection(
    collectionPath: string,
    query?: (query: CollectionReference<DocumentData>) => Query<DocumentData>
  ): Promise<ServiceResult<any[]>> {
    try {
      this.logProgress(`Extracting collection: ${collectionPath}`);
      let firestoreQuery: Query<DocumentData> = this.firestore.collection(collectionPath);
      
      if (query) {
        firestoreQuery = query(this.firestore.collection(collectionPath));
      }

      const snapshot = await this.retry(() => firestoreQuery.get());
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      this.progress.total = documents.length;
      this.progress.successful = documents.length;
      this.progress.processed = documents.length;

      this.logProgress(`Successfully extracted ${documents.length} documents from ${collectionPath}`);
      return {
        data: documents,
        error: null
      };
    } catch (error) {
      const serviceError: ServiceError = {
        code: 'EXTRACTION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error during extraction',
        details: error
      };
      return {
        data: null,
        error: serviceError
      };
    }
  }

  public async extractDocument(
    documentPath: string
  ): Promise<ServiceResult<any>> {
    try {
      this.logProgress(`Extracting document: ${documentPath}`);
      const doc = await this.retry(() => this.firestore.doc(documentPath).get());

      if (!doc.exists) {
        throw new Error(`Document not found: ${documentPath}`);
      }

      const data = {
        id: doc.id,
        ...doc.data()
      };

      this.progress.successful++;
      this.progress.processed++;

      this.logProgress(`Successfully extracted document: ${documentPath}`);
      return {
        data,
        error: null
      };
    } catch (error) {
      this.logError(documentPath, error);
      const serviceError: ServiceError = {
        code: 'EXTRACTION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error during extraction',
        details: error
      };
      return {
        data: null,
        error: serviceError
      };
    }
  }

  public async extractRelationships(
    collectionPath: string,
    relationshipField: string,
    targetIds: string[]
  ): Promise<ServiceResult<Array<{ sourceId: string; targetId: string }>>> {
    try {
      this.logProgress(`Extracting relationships from ${collectionPath}`);
      const relationships: Array<{ sourceId: string; targetId: string }> = [];

      // Process in batches to avoid memory issues
      for (let i = 0; i < targetIds.length; i += this.options.batchSize) {
        const batch = targetIds.slice(i, i + this.options.batchSize);
        const query = this.firestore
          .collection(collectionPath)
          .where(relationshipField, 'in', batch);

        const snapshot = await this.retry(() => query.get());
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const targetId = data[relationshipField];
          if (targetId) {
            relationships.push({
              sourceId: doc.id,
              targetId
            });
          }
        });

        this.progress.processed += batch.length;
        this.progress.successful += snapshot.docs.length;
      }

      this.logProgress(`Successfully extracted ${relationships.length} relationships from ${collectionPath}`);
      return {
        data: relationships,
        error: null
      };
    } catch (error) {
      const serviceError: ServiceError = {
        code: 'EXTRACTION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error during relationship extraction',
        details: error
      };
      return {
        data: null,
        error: serviceError
      };
    }
  }

  public getProgress(): ExtractionProgress {
    return { ...this.progress };
  }

  public resetProgress(): void {
    this.progress = {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: []
    };
  }
} 