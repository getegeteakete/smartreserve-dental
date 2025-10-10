/**
 * 統一されたエラーハンドリングユーティリティ
 */

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: unknown;
}

export class CustomError extends Error implements AppError {
  code?: string;
  statusCode?: number;
  details?: unknown;

  constructor(message: string, code?: string, statusCode?: number, details?: unknown) {
    super(message);
    this.name = 'CustomError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * エラーメッセージを統一された形式に変換
 */
export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof CustomError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  
  return '予期しないエラーが発生しました';
};

/**
 * Supabaseエラーを適切な形式に変換
 */
export const handleSupabaseError = (error: unknown): CustomError => {
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as { code: string; message: string; details?: unknown };
    
    switch (supabaseError.code) {
      case '23505':
        return new CustomError('既に存在するデータです', 'DUPLICATE_ENTRY', 400);
      case '23503':
        return new CustomError('関連するデータが見つかりません', 'FOREIGN_KEY_VIOLATION', 400);
      case 'PGRST116':
        return new CustomError('データが見つかりません', 'NOT_FOUND', 404);
      default:
        return new CustomError(
          supabaseError.message || 'データベースエラーが発生しました',
          supabaseError.code,
          500,
          supabaseError.details
        );
    }
  }
  
  return new CustomError(formatErrorMessage(error), 'UNKNOWN_ERROR', 500);
};

/**
 * 統一されたエラーログ出力
 */
export const logError = (error: unknown, context?: string): void => {
  const formattedError = error instanceof CustomError ? error : handleSupabaseError(error);
  
  const logData = {
    message: formattedError.message,
    code: formattedError.code,
    statusCode: formattedError.statusCode,
    context,
    timestamp: new Date().toISOString(),
    details: formattedError.details
  };
  
  // 開発環境でのみコンソール出力
  console.error('Error logged:', logData);
  
  // 本番環境では外部ログサービスに送信する処理をここに追加
}; 