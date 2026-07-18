/**
 * Enterprise Observability Logger
 * 
 * In production, this wraps a logging framework like Winston or Pino
 * and pushes structured JSON logs to Datadog, ELK, or New Relic.
 */
export class Logger {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  private formatMessage(level: string, message: string, meta?: any) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      ...meta
    });
  }

  public info(message: string, meta?: any) {
    console.log(this.formatMessage('INFO', message, meta));
  }

  public warn(message: string, meta?: any) {
    console.warn(this.formatMessage('WARN', message, meta));
  }

  public error(message: string, error?: Error, meta?: any) {
    console.error(this.formatMessage('ERROR', message, { 
      error: error?.message, 
      stack: error?.stack, 
      ...meta 
    }));
  }

  public security(message: string, meta?: any) {
    // High-priority alert channel for security events (e.g. failed auth, unauthorized data access)
    console.error(this.formatMessage('SECURITY_ALERT', message, meta));
  }
}
