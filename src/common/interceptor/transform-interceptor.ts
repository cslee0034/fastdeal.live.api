import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type PossibleError = Error | null | undefined;

interface ObjectWithSuccess {
  success: boolean;
  [key: string]: any;
}

type ApiResponseData = ObjectWithSuccess | Error | { success: false };

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        return this.transformResponse(data);
      }),
    );
  }

  private transformResponse(data: any): ApiResponseData {
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

  private handleSuccess(data: any): ObjectWithSuccess {
    if (typeof data !== 'object' || !('success' in data)) {
      return { success: true, data };
    }
    const { success, ...resultData } = data;
    return { success, data: resultData };
  }
}
