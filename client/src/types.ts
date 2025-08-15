export interface Level {
    id: number,
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

export interface Question {
    enunciation: string,
    alternatives: string[],
    answer: number
}


