import { Logger } from '@nestjs/common';

export function LogMethod(): MethodDecorator {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      Logger.debug(`Method ${propertyKey} called with arguments: ${JSON.stringify(args)}`, target.constructor.name);

      const startTime = Date.now();
      const result = await originalMethod.apply(this, args);
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      Logger.debug(`Execution time: ${executionTime}ms`, target.constructor.name);
      return result;
    };
    return descriptor;
  };
}
