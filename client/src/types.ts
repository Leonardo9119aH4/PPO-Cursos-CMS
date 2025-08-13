export interface Level {
    type: string;
    content: object;
    recoveryLifes: number;
    order: number;
    courseId: number;
}

export interface Course {
    id: number;
    title: string;
    maxLifes: number;
    description: string | undefined;
    secondsRecoveryLife: number;
    practiceRecoveryLife: number;
    thubnail: string;
    state: number;
    userId: number;
    [key: string]: any;
    levels: Level[];
}



