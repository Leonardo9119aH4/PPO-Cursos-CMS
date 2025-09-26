export interface TipTapNode {
    type: string;
    attrs?: { [key: string]: any };
    content?: TipTapNode[];
    text?: string;
    marks?: any[];
}

export interface TipTapDocument {
    type: "doc";
    content: TipTapNode[];
    [key: string]: any;
}

export interface QuizContent {
    alternatives: any[],
    answer: number,
    enunciation: string,
    penalization: number
}

export interface User {
    id: number,
    username: String,
    password: String,
    realname: String,
    email: String,
    phone?: String
}

export interface Level {
    id: number,
    type: string;
    content: QuizContent[] | TipTapDocument;
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
    levelPosts: Level[];
}

export interface Question {
    enunciation: string,
    alternatives: string[],
    answer: number,
    penalization: number
}

export interface Studying {
    id: number,
    xp: number,
    lifes: number,
    levels: number,
    userId: number,
    courseId: number
}
