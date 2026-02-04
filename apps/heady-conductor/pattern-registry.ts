/**
 * Pattern Registry - Central repository for all system patterns
 * Tracks implementation, validation, and superiority metrics
 */

export enum PatternCategory {
  DATA_FLOW = 'DATA_FLOW',
  LOGIC = 'LOGIC',
  SECURITY = 'SECURITY',
  TRUST = 'TRUST',
  GOVERNANCE = 'GOVERNANCE',
  COMMUNICATION = 'COMMUNICATION',
  TRACEROUTE = 'TRACEROUTE',
  PROMPT = 'PROMPT',
  RESPONSE = 'RESPONSE',
  NAMING = 'NAMING',
  BINARY = 'BINARY',
}

export interface Pattern {
  id: string;
  category: PatternCategory;
  name: string;
  description: string;
  implementation: string; // File path or service reference
  examples: string[];
  antiPatterns: string[];
  metrics: PatternMetrics;
  strictness: 'STRICT' | 'MODERATE' | 'FLEXIBLE';
  enforcementLevel: 'REQUIRED' | 'RECOMMENDED' | 'OPTIONAL';
}

export interface PatternMetrics {
  usageCount: number;
  violationCount: number;
  performanceImpact: number; // 0-100
  securityScore: number; // 0-100
  maintainabilityIndex: number; // 0-100
  lastValidated: Date;
  superiorityScore: number; // 0-100 vs competitors
}

export interface PatternViolation {
  patternId: string;
  location: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  detectedAt: Date;
  autoFixable: boolean;
  suggestedFix?: string;
}

export interface ConceptImplementation {
  conceptId: string;
  conceptName: string;
  description: string;
  implementations: Implementation[];
  superiorityScore: number;
  competitorAnalysis: CompetitorAnalysis[];
  lastValidated: Date;
}

export interface Implementation {
  location: string;
  language: string;
  codeQuality: number;
  performance: number;
  security: number;
  maintainability: number;
  testCoverage: number;
  documentation: number;
}

export interface CompetitorAnalysis {
  competitor: string;
  concept: string;
  ourScore: number;
  theirScore: number;
  advantages: string[];
  gaps: string[];
  recommendations: string[];
}

export interface CommunicationTrace {
  traceId: string;
  correlationId: string;
  startTime: Date;
  endTime: Date;
  hops: Hop[];
  totalLatency: number;
  errors: TraceError[];
  pattern: string; // request-response, pub-sub, etc.
}

export interface Hop {
  service: string;
  operation: string;
  startTime: Date;
  duration: number;
  status: 'success' | 'error' | 'timeout';
  metadata: Record<string, any>;
  spanId: string;
  parentSpanId?: string;
}

export interface TraceError {
  service: string;
  message: string;
  stack?: string;
  timestamp: Date;
}

export interface PromptPattern {
  id: string;
  template: string;
  variables: string[];
  expectedResponseFormat: ResponseSchema;
  successRate: number;
  averageLatency: number;
  tokenUsage: TokenMetrics;
  examples: PromptExample[];
}

export interface ResponseSchema {
  format: 'json' | 'markdown' | 'text' | 'code';
  schema: any;
  validationRules: ValidationRule[];
  postProcessing: string[];
}

export interface TokenMetrics {
  averagePromptTokens: number;
  averageResponseTokens: number;
  totalTokens: number;
  costPerRequest: number;
}

export interface PromptExample {
  input: string;
  output: string;
  success: boolean;
  latency: number;
  timestamp: Date;
}

export interface ValidationRule {
  field: string;
  rule: string;
  message: string;
}

export interface BinaryPattern {
  offset: number;
  length: number;
  pattern: Buffer;
  description: string;
  significance: 'critical' | 'high' | 'medium' | 'low';
  fileType: string;
}

export interface NamingConvention {
  type: 'file' | 'variable' | 'function' | 'class' | 'interface' | 'type' | 'constant';
  pattern: RegExp;
  description: string;
  examples: string[];
  counterExamples: string[];
}

/**
 * Pattern Registry Class
 */
export class PatternRegistry {
  private patterns: Map<string, Pattern> = new Map();
  private concepts: Map<string, ConceptImplementation> = new Map();
  private traces: Map<string, CommunicationTrace> = new Map();
  private prompts: Map<string, PromptPattern> = new Map();
  private violations: PatternViolation[] = [];

  constructor() {
    this.initializeDefaultPatterns();
  }

  private initializeDefaultPatterns(): void {
    // Data Flow Patterns
    this.registerPattern({
      id: 'df-001',
      category: PatternCategory.DATA_FLOW,
      name: 'Input Validation',
      description: 'All external inputs must be validated before processing',
      implementation: 'apps/api/src/middleware/validation.ts',
      examples: ['Zod schema validation', 'Express validator middleware'],
      antiPatterns: ['Direct database queries from user input', 'Unvalidated API parameters'],
      strictness: 'STRICT',
      enforcementLevel: 'REQUIRED',
      metrics: {
        usageCount: 0,
        violationCount: 0,
        performanceImpact: 85,
        securityScore: 95,
        maintainabilityIndex: 90,
        lastValidated: new Date(),
        superiorityScore: 92,
      },
    });

    // Security Patterns
    this.registerPattern({
      id: 'sec-001',
      category: PatternCategory.SECURITY,
      name: 'JWT Authentication',
      description: 'All API endpoints must validate JWT tokens',
      implementation: 'apps/api/src/middleware/auth.ts',
      examples: ['Bearer token validation', 'JWT signature verification'],
      antiPatterns: ['Storing passwords in plaintext', 'Weak token generation'],
      strictness: 'STRICT',
      enforcementLevel: 'REQUIRED',
      metrics: {
        usageCount: 0,
        violationCount: 0,
        performanceImpact: 90,
        securityScore: 98,
        maintainabilityIndex: 88,
        lastValidated: new Date(),
        superiorityScore: 95,
      },
    });

    // Trust Patterns
    this.registerPattern({
      id: 'trust-001',
      category: PatternCategory.TRUST,
      name: 'Zero Trust Architecture',
      description: 'Never trust, always verify - validate every request',
      implementation: 'apps/api/src/middleware/trust.ts',
      examples: ['Certificate pinning', 'Mutual TLS', 'Request signing'],
      antiPatterns: ['Implicit trust', 'Network-based security only'],
      strictness: 'STRICT',
      enforcementLevel: 'REQUIRED',
      metrics: {
        usageCount: 0,
        violationCount: 0,
        performanceImpact: 88,
        securityScore: 99,
        maintainabilityIndex: 85,
        lastValidated: new Date(),
        superiorityScore: 96,
      },
    });

    // Governance Patterns
    this.registerPattern({
      id: 'gov-001',
      category: PatternCategory.GOVERNANCE,
      name: 'Audit Logging',
      description: 'All privileged actions must be logged immutably',
      implementation: 'apps/api/src/services/audit.service.ts',
      examples: ['Append-only logs', 'Cryptographic signatures', 'Tamper detection'],
      antiPatterns: ['Mutable logs', 'Missing timestamps', 'No user attribution'],
      strictness: 'STRICT',
      enforcementLevel: 'REQUIRED',
      metrics: {
        usageCount: 0,
        violationCount: 0,
        performanceImpact: 82,
        securityScore: 97,
        maintainabilityIndex: 91,
        lastValidated: new Date(),
        superiorityScore: 94,
      },
    });

    // Communication Patterns
    this.registerPattern({
      id: 'comm-001',
      category: PatternCategory.COMMUNICATION,
      name: 'Request-Response with Timeout',
      description: 'All synchronous requests must have explicit timeouts',
      implementation: 'apps/api/src/utils/http-client.ts',
      examples: ['Axios with timeout', 'Fetch with AbortController'],
      antiPatterns: ['Infinite waits', 'No error handling', 'Missing retries'],
      strictness: 'STRICT',
      enforcementLevel: 'REQUIRED',
      metrics: {
        usageCount: 0,
        violationCount: 0,
        performanceImpact: 93,
        securityScore: 85,
        maintainabilityIndex: 89,
        lastValidated: new Date(),
        superiorityScore: 91,
      },
    });

    // Naming Conventions
    this.registerPattern({
      id: 'name-001',
      category: PatternCategory.NAMING,
      name: 'Conventional Commits',
      description: 'All commits must follow conventional commit format',
      implementation: '.husky/commit-msg',
      examples: ['feat: add user auth', 'fix: resolve memory leak', 'docs: update README'],
      antiPatterns: ['WIP', 'fix stuff', 'updates'],
      strictness: 'STRICT',
      enforcementLevel: 'REQUIRED',
      metrics: {
        usageCount: 0,
        violationCount: 0,
        performanceImpact: 100,
        securityScore: 70,
        maintainabilityIndex: 95,
        lastValidated: new Date(),
        superiorityScore: 88,
      },
    });
  }

  registerPattern(pattern: Pattern): void {
    this.patterns.set(pattern.id, pattern);
  }

  getPattern(id: string): Pattern | undefined {
    return this.patterns.get(id);
  }

  getPatternsByCategory(category: PatternCategory): Pattern[] {
    return Array.from(this.patterns.values()).filter(p => p.category === category);
  }

  recordViolation(violation: PatternViolation): void {
    this.violations.push(violation);
    const pattern = this.patterns.get(violation.patternId);
    if (pattern) {
      pattern.metrics.violationCount++;
    }
  }

  getViolations(severity?: string): PatternViolation[] {
    if (severity) {
      return this.violations.filter(v => v.severity === severity);
    }
    return this.violations;
  }

  registerConcept(concept: ConceptImplementation): void {
    this.concepts.set(concept.conceptId, concept);
  }

  validateSuperiority(conceptId: string): boolean {
    const concept = this.concepts.get(conceptId);
    return concept ? concept.superiorityScore >= 85 : false;
  }

  recordTrace(trace: CommunicationTrace): void {
    this.traces.set(trace.traceId, trace);
  }

  analyzeTracePattern(traceId: string): any {
    const trace = this.traces.get(traceId);
    if (!trace) return null;

    return {
      bottlenecks: this.identifyBottlenecks(trace),
      redundantCalls: this.findRedundantCalls(trace),
      optimizations: this.suggestOptimizations(trace),
      securityConcerns: this.detectSecurityIssues(trace),
    };
  }

  private identifyBottlenecks(trace: CommunicationTrace): any[] {
    return trace.hops
      .filter(hop => hop.duration > 1000)
      .map(hop => ({
        service: hop.service,
        operation: hop.operation,
        duration: hop.duration,
      }));
  }

  private findRedundantCalls(trace: CommunicationTrace): any[] {
    const calls = new Map<string, number>();
    trace.hops.forEach(hop => {
      const key = `${hop.service}:${hop.operation}`;
      calls.set(key, (calls.get(key) || 0) + 1);
    });
    
    return Array.from(calls.entries())
      .filter(([_, count]) => count > 1)
      .map(([key, count]) => ({ operation: key, count }));
  }

  private suggestOptimizations(trace: CommunicationTrace): string[] {
    const suggestions: string[] = [];
    
    if (trace.totalLatency > 5000) {
      suggestions.push('Consider implementing caching');
    }
    
    if (trace.hops.length > 10) {
      suggestions.push('Consider reducing service hops');
    }
    
    return suggestions;
  }

  private detectSecurityIssues(trace: CommunicationTrace): string[] {
    const issues: string[] = [];
    
    trace.hops.forEach(hop => {
      if (!hop.metadata.authenticated) {
        issues.push(`Unauthenticated call to ${hop.service}`);
      }
    });
    
    return issues;
  }

  registerPromptPattern(prompt: PromptPattern): void {
    this.prompts.set(prompt.id, prompt);
  }

  trackPromptEffectiveness(promptId: string, success: boolean, latency: number): void {
    const prompt = this.prompts.get(promptId);
    if (prompt) {
      const totalRequests = prompt.examples.length + 1;
      const successCount = prompt.examples.filter(e => e.success).length + (success ? 1 : 0);
      prompt.successRate = successCount / totalRequests;
      prompt.averageLatency = (prompt.averageLatency * prompt.examples.length + latency) / totalRequests;
    }
  }

  generateReport(): any {
    return {
      timestamp: new Date(),
      patterns: {
        total: this.patterns.size,
        byCategory: this.getPatternCountByCategory(),
        violations: this.violations.length,
        criticalViolations: this.violations.filter(v => v.severity === 'CRITICAL').length,
      },
      concepts: {
        total: this.concepts.size,
        superior: Array.from(this.concepts.values()).filter(c => c.superiorityScore >= 85).length,
        needsImprovement: Array.from(this.concepts.values()).filter(c => c.superiorityScore < 85).length,
      },
      communication: {
        totalTraces: this.traces.size,
        averageLatency: this.calculateAverageLatency(),
        errorRate: this.calculateErrorRate(),
      },
      prompts: {
        total: this.prompts.size,
        averageSuccessRate: this.calculateAveragePromptSuccess(),
      },
    };
  }

  private getPatternCountByCategory(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.patterns.forEach(pattern => {
      counts[pattern.category] = (counts[pattern.category] || 0) + 1;
    });
    return counts;
  }

  private calculateAverageLatency(): number {
    const traces = Array.from(this.traces.values());
    if (traces.length === 0) return 0;
    return traces.reduce((sum, t) => sum + t.totalLatency, 0) / traces.length;
  }

  private calculateErrorRate(): number {
    const traces = Array.from(this.traces.values());
    if (traces.length === 0) return 0;
    const errored = traces.filter(t => t.errors.length > 0).length;
    return errored / traces.length;
  }

  private calculateAveragePromptSuccess(): number {
    const prompts = Array.from(this.prompts.values());
    if (prompts.length === 0) return 0;
    return prompts.reduce((sum, p) => sum + p.successRate, 0) / prompts.length;
  }
}

// Singleton instance
export const patternRegistry = new PatternRegistry();
