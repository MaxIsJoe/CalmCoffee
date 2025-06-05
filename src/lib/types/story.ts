export type Story = {
    id: string;
    author_id: string;
    title: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
    chapters?: Array<string>;
    age_rating: AgeRating;
    tags?: Array<string>;
};

export enum AgeRating { "Everyone" = "Everyone", "Teen" = "Teen", "Mature" = "Mature", "Adult" = "Adult" }