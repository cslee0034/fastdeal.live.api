import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ObjectWithSuccess } from '../interface/object-with-success';

type PossibleError = Error | null | undefined;

type ApiResponseData<T = any> =
  | ObjectWithSuccess<T>
  | Error
  | { success: false };

@Injectable()
export class TransformInterceptor<T = any> implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseData<T>> {
    return next.handle().pipe(
      map((data: T) => {
        return this.transformResponse(data);
      }),
    );
  }

  private transformResponse(data: T): ApiResponseData<T> {
    if (this.isErrorResponse(data)) {
      return this.handleError(data);
    }
    return this.handleSuccess(data);
  }
  /**
   * data is PossibleError:
   * 함수가 true를 반환하면 해당 스코프 내에서 data를 PossibleError으로 간주
   */
  private isErrorResponse(data: any): data is PossibleError {
    return data instanceof Error || data === null || data === undefined;
  }

  private handleError(data: PossibleError): Error | { success: false } {
    // exception filter에서 처리
    if (data instanceof Error) {
      throw data;
    }
    return { success: false };
  }

  private handleSuccess(data: T): ObjectWithSuccess<T> {
    if (typeof data !== 'object' || !('success' in data)) {
      return { success: true, data };
    }
    const { success, ...resultData } = data as any;
    return { success, data: resultData };
  }
}
