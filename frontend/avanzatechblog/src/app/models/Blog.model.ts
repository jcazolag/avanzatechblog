import { Post } from "./Post.model";

export interface Blog{
    current_page: number,
    total_pages: number,
    total_count: number,
    next_page: string | null,
    previous_page: string | null,
    results: Post[]
}