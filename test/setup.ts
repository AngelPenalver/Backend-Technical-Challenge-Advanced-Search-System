import { Logger } from '@nestjs/common';

/** Silencia el Logger de Nest durante los tests. */
const levels = ['log', 'error', 'warn', 'debug', 'verbose', 'fatal'] as const;
for (const level of levels) {
  jest.spyOn(Logger.prototype, level).mockImplementation(() => undefined);
}
