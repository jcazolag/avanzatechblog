export interface Like{
    id: number;
    user: number;
    blog: number;
    user_name: string;
    created_at: string;
}

export interface LikeResponse{
    current_page: number;
    total_pages: number;
    total_count: number;
    next_page: string | null;
    previous_page: string | null;
    results: Like[];
}

export interface LikePostResponse{
    message?: string;
    Like?: Like
}