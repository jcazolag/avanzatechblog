export interface Post{
    id: number;
    author: number;
    author_name: string;
    author_team: number;
    author_team_title: string;
    title: string;
    content: string;
    excerpt: string;
    timestamp: string;
    author_access: string;
    team_access: string;
    authenticated_access: string;
    public_access: string;
}

export interface NewPost{
    title: string;
    content: string;
    author_access: string;
    team_access: string;
    authenticated_access: string;
    public_access: string;
}

export interface PostResponse{
    message: string;
    post?: Post
}