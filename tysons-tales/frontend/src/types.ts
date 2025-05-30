export interface Character {
    id?: string;
    name: string;
    gender: 'girl' | 'boy' | 'neutral';
    role: string;
    personalities: string[];
    favorite_color?: string;
    favorite_animal?: string;
    user_id?: string;
}

export interface StoryNode {
    story_text: string;
    illustration_url: string;
    illustration_prompt: string;
    choices: Choice[];
    current_node_id: string;
}

export interface Choice {
    text: string;
    next_node_id: string;
}

export interface Theme {
    id: string;
    name: string;
    description: string;
}

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
} 