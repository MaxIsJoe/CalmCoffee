import type { CoffeeMarkdownStyles } from "$lib/md/coffeeMarkdown";
import type { AgeRating } from "./story";

export interface BlogType {
		age_rating: AgeRating;
		content: string;
		created_at: string;
		edited_at: string;
		post_id: number;
		styles: CoffeeMarkdownStyles;
		writer: string;
		tags: string[];
		profiles: {
			username: string | null;
			avatar_url: string | null;
		} | null;
	}