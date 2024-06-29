import { ApiResponseProperty } from '@nestjs/swagger';

export class ResponseErrorDto {
  @ApiResponseProperty()
  message: string;

  @ApiResponseProperty()
  code: number;

  @ApiResponseProperty()
  name: string;

  @ApiResponseProperty()
  payload?: Record<string, unknown>;

  @ApiResponseProperty()
  path: string;
}

export class GenericResponse<T = unknown> {
  @ApiResponseProperty({
    example: 200,
    type: 'number',
  })
  code = 200;

  @ApiResponseProperty()
  success: boolean;

  @ApiResponseProperty({
    example: [],
  })
  error: ResponseErrorDto;

  @ApiResponseProperty()
  data: T = null;
}

export const CreateGenericResponse = <T>(data: T | null, error: ResponseErrorDto = null, code = 200): GenericResponse<T> => {
  return {
    code,
    data,
    success: error ? false : true,
    error,
  };
};
