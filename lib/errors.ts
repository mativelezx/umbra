export class RateLimitError extends Error {
  constructor(public retryAfter: number = 86400) {
    super('rate_limited');
    this.name = 'RateLimitError';
  }
}

export class BudgetExceededError extends Error {
  constructor() {
    super('budget_exceeded');
    this.name = 'BudgetExceededError';
  }
}

export class CrisisDetected extends Error {
  constructor(
    public severity: 'low' | 'med' | 'high' | 'classifier_error',
    public hits: string[] = [],
  ) {
    super('crisis');
    this.name = 'CrisisDetected';
  }
}

export class ClassifierFailure extends Error {
  constructor(public reason: string) {
    super('classifier_error');
    this.name = 'ClassifierFailure';
  }
}

export class ClaudeError extends Error {
  constructor(public originalError: unknown) {
    super('ai_unavailable');
    this.name = 'ClaudeError';
  }
}

export class ConsentRequiredError extends Error {
  constructor() {
    super('consent_required');
    this.name = 'ConsentRequiredError';
  }
}

export class SessionExpiredError extends Error {
  constructor() {
    super('session_expired');
    this.name = 'SessionExpiredError';
  }
}

export class NotFoundError extends Error {
  constructor(public resource: string) {
    super('not_found');
    this.name = 'NotFoundError';
  }
}
