export interface Comment{
    id: number;
    user: number; 
    user_name: string;
    blog: number;
    content:string;
    blog_title: string;
    timestamp: string;
}

export interface CommentResponse{
    current_page: number;
    total_pages: number;
    total_count: number;
    next_page: string | null,
    previous_page: string | null,
    results: Comment[];
}