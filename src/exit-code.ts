/**
 * CLI exit codes.
 *
 * @see https://nodejs.org/api/process.html#process_exit_codes
 * @internal
 */
export const enum ExitCode {
  Success = 0,
  FatalError = 1,
  InvalidArgument = 9
}
