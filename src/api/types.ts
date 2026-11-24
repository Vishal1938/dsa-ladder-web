// Mirrors backend/src/main/java/dev/dsaladder/api/Dtos.java
export interface TopicSummary { id: string; name: string; idea: string; hasBook: boolean; stageCount: number; problemCount: number; solvedCount: number }
export interface ExamProblem { id: number; title: string; url: string; note: string; rating: number }
export interface ProblemRow { slug: string; title: string; difficulty: string; whatsNew: string; order: number; solved: boolean; attempted: boolean }
export interface Stage { index: number; name: string; problems: ProblemRow[]; exam: ExamProblem[] }
export interface TopicDetail { id: string; name: string; idea: string; triggers: string[]; hasBook: boolean; stages: Stage[] }
export interface Example { input: string; output: string; explanation?: string }
export interface Param { name: string; type: string }
export interface ProblemDetail {
  slug: string; title: string; topic: string; topicName: string; stage: number; stageName: string; difficulty: string;
  whatsNew: string; statement: string; examples: Example[]; hints: string[]; trigger: string; starterCode: string;
  signature: string; params: Param[]; sampleInputs: string[][]; timeLimitMs: number; prev?: string | null; next?: string | null; solved: boolean;
}
export type Status = "ACCEPTED" | "WRONG_ANSWER" | "COMPILE_ERROR" | "RUNTIME_ERROR" | "TIME_LIMIT_EXCEEDED" | "OUTPUT_LIMIT_EXCEEDED" | "INTERNAL_ERROR";
export interface CaseResult { index: number; passed: boolean; hidden: boolean; input?: string; expected?: string; actual?: string; stdout?: string; runtimeMicros?: number }
export interface Verdict { status: Status; passed: number; total: number; runtimeMs: number; compileOutput?: string; error?: string; cases: CaseResult[]; submissionId?: number; saved?: boolean }
export interface User { id: number; email: string; displayName: string }
export interface AuthResponse { token: string; user: User }
export interface Submission { id: number; problemSlug: string; status: Status; passed: number; total: number; runtimeMs: number; createdAt: string; code?: string }
export interface Stats { solved: number; attempted: number; totalProblems: number; solvedByTopic: Record<string, number>; recent: Submission[] }
