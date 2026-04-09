export class McpServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'McpServerError';
  }
}