export interface CourseInfo {
    id: number;
    title: string;
    maxLifes: number;
    timeRecoveryLife: string;
    practiceRecoveryLife: number;
    userId: number;
}

export interface Level {
    type: string;
    content: object;
    recoveryLifes: number;
    order: number;
    courseId: number;
}

export interface Course {
    courseInfo: CourseInfo;
    levels: Level[];
}