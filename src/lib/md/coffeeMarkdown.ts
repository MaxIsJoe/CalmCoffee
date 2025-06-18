export type CoffeeMarkdownStyles = {
	h1?: string;
	h2?: string;
	h3?: string;
	h4?: string;
	h5?: string;
	h6?: string;
	p?: string;
	a?: string;
	ul?: string;
	ol?: string;
	li?: string;
	blockquote?: string;
	img?: string;
	b?: string;
	i?: string;
	code?: string;
	pre?: string;
	bgc?: string;
	custom?: string; // default style for <custom> tag (optional)
	align?: string; // Add this new style for alignment
	section?: string; // New style for the overall section container
};

export const defaultStyles: Required<CoffeeMarkdownStyles> = {
	h1: 'font-size:2rem;color:var(--color-link);font-weight:600;margin:1.2em 0 0.6em 0;line-height:1.2;',
	h2: 'font-size:1.5rem;color:var(--color-link);font-weight:600;margin:1.2em 0 0.6em 0;line-height:1.2;',
	h3: 'font-size:1.2rem;color:var(--color-link);font-weight:600;margin:1.2em 0 0.6em 0;line-height:1.2;',
	h4: 'font-size:1.1rem;color:var(--color-link);font-weight:600;margin:1.2em 0 0.6em 0;line-height:1.2;',
	h5: 'font-size:1rem;color:var(--color-link);font-weight:600;margin:1.2em 0 0.6em 0;line-height:1.2;',
	h6: 'font-size:0.95rem;color:var(--color-link);font-weight:600;margin:1.2em 0 0.6em 0;line-height:1.2;',
	p: 'margin:0.7em 0;color:var(--color-text);font-size:1.05rem;',
	a: 'color:var(--color-link);text-decoration:underline;word-break:break-all;',
	ul: 'margin:0.7em 0 0.7em 1.5em;',
	ol: 'margin:0.7em 0 0.7em 1.5em;',
	li: 'margin-bottom:0.3em;',
	blockquote: 'border-left:4px solid var(--color-link);background:var(--color-bg-alt);padding:0.7em 1em;margin:1em 0;color:var(--color-text);border-radius:6px;',
	img: 'max-width:100%;display:block;margin:1em auto;border-radius:6px;box-shadow:0 1px 4px var(--color-card-shadow);',
	b: 'font-weight:700;',
	i: 'font-style:italic;',
	code: 'background:var(--color-secondary);color:var(--color-link);padding:0.15em 0.4em;border-radius:4px;font-size:0.98em;',
	pre: 'display:block;padding:1em;overflow-x:auto;background:var(--color-bg-alt);border-radius:8px;',
	bgc: 'padding:0.7em 1em;border-radius:8px;margin:1em 0;background:var(--color-bg-alt);color:var(--color-text);',
	custom: '', // no default, user must provide
	align: 'text-align:center;', // Default alignment style
	section: 'margin:1em 0; overflow:hidden;', // Default style for sections
};

//background-image: url('https://wallpaperaccess.com/full/781336.jpg')

export function coffeeMarkdown(md: string, styles: CoffeeMarkdownStyles = {}): string {
	const mergedStyles = { ...defaultStyles, ...styles };

	if (!md || typeof md !== 'string') {
		console.error('Invalid markdown input:', md);
		return '';
	}

	md = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

	let html = escapeHtml(md);

		// 1. Custom block containers
	html = handleColumns(html, mergedStyles);
	html = handleBgc(html, mergedStyles);
	html = handleCustom(html, mergedStyles);
	html = handleAlignment(html, mergedStyles);

	// 2. Standard block elements
	html = handleCodeBlocks(html, mergedStyles);
	html = handleInlineCode(html, mergedStyles);
	html = handleImages(html, mergedStyles);
	html = handleHeadings(html, mergedStyles);
	html = handleBlockquotes(html, mergedStyles);
	html = handleUnorderedLists(html, mergedStyles);
	html = handleOrderedLists(html, mergedStyles);

	// 3. Inline elements
	html = handleLinks(html, mergedStyles);
	html = handleBold(html, mergedStyles);
	html = handleUnderline(html);
	html = handleItalic(html, mergedStyles);
	html = handleEscapedNewlines(html);

	// 4. Paragraphs last
	html = handleParagraphs(html, mergedStyles);

	return html;
}

function escapeHtml(md: string): string {
	const allowedTags = ['u', 'b', 'i', 'code', 'pre', 'custom', 'bgc', 'url', 'br', 'align', 'columns'];

	return md.replace(/<([^>]+)>/g, (match, tagContent) => {
		const tagNameMatch = tagContent.match(/^\/?([a-zA-Z0-9-]+)/);
		if (tagNameMatch) {
			const tagName = tagNameMatch[1].toLowerCase();
			if (allowedTags.includes(tagName)) {
    			return `<${tagContent}>`;
			}
		}
		// Escape the entire tag
		return `&lt;${tagContent.replace(/"/g, '&quot;').replace(/'/g, '&#39;')}&gt;`;
	});
}

function handleBgc(html: string, mergedStyles: Required<CoffeeMarkdownStyles>): string {
	return html.replace(
		/<bgc(?:\s+([^>]*?))?>([\s\S]*?)<\/bgc>/gi,
		(_, attrs = '', content) => {
			attrs = attrs.trim();
			let bg = '';
			let text = '';
			const bgMatch = attrs.match(/bg\s*:\s*([#\w\d(),.%]+)/i);
			const textMatch = attrs.match(/text\s*:\s*([#\w\d(),.%]+)/i);
			if (bgMatch) bg = bgMatch[1];
			if (textMatch) text = textMatch[1];
			const userStyle = [
				bg ? `background:${bg};` : '',
				text ? `color:${text};` : ''
			].join('');
			const style = `${mergedStyles.bgc}${userStyle}`;
			return `<div style="${style}">${content}</div>`;
		}
	);
}

function handleCustom(html: string, mergedStyles: Required<CoffeeMarkdownStyles>): string {
	return html.replace(
		/&lt;custom\s+style=(["']|&quot;)([\s\S]*?)\1&gt;([\s\S]*?)&lt;\/custom&gt;/gi,
		(_, _quote, userStyle, content) => {
			const unescapedStyle = userStyle.replace(/&quot;/g, '"'); // just in case
			const style = `${mergedStyles.custom || ''}${unescapedStyle}`.trim();
			return `<span style="${style}">${content}</span>`;
		}
	);
}

function handleAlignment(html: string, mergedStyles: Required<CoffeeMarkdownStyles>): string {
	return html.replace(
		/<align\s+([^>]+)>([\s\S]*?)<\/align>/gi,
		(_, alignment, content) => {
			const alignValue = alignment.trim().toLowerCase();
			let style = '';
			
			switch(alignValue) {
				case 'left':
					style = 'text-align:left;';
					break;
				case 'right':
					style = 'text-align:right;';
					break;
				case 'center':
					style = 'text-align:center;';
					break;
				case 'justify':
					style = 'text-align:justify; padding:0.8em; margin:1em 0;';
					break;
				default:
					style = mergedStyles.align;
			}
			
			return `<div style="${style}">${content}</div>`;
		}
	);
}

function handleCodeBlocks(html: string, mergedStyles: Required<CoffeeMarkdownStyles>): string {
	return html.replace(/```([\s\S]*?)```/g, (_, code) => {
		return `<pre style="${mergedStyles.pre}"><code style="${mergedStyles.code}">${code.replace(/^\n+|\n+$/g, '')}</code></pre>`;
	});
}

function handleInlineCode(html: string, mergedStyles: Required<CoffeeMarkdownStyles>): string {
	return html.replace(/`([^`]+)`/g, `<code style="${mergedStyles.code}">$1</code>`);
}

function handleHeadings(html: string, mergedStyles: Required<CoffeeMarkdownStyles>): string {
	return html
		.replace(/^###### (.*)$/gm, `<h6 style="${mergedStyles.h6}">$1</h6>`)
		.replace(/^##### (.*)$/gm, `<h5 style="${mergedStyles.h5}">$1</h5>`)
		.replace(/^#### (.*)$/gm, `<h4 style="${mergedStyles.h4}">$1</h4>`)
		.replace(/^### (.*)$/gm, `<h3 style="${mergedStyles.h3}">$1</h3>`)
		.replace(/^## (.*)$/gm, `<h2 style="${mergedStyles.h2}">$1</h2>`)
		.replace(/^# (.*)$/gm, `<h1 style="${mergedStyles.h1}">$1</h1>`);
}

function handleBlockquotes(html: string, mergedStyles: Required<CoffeeMarkdownStyles>): string {
	return html.replace(/(^|\n)(>[^\n]*(?:\n>[^\n]*)*)/g, (match, sep, quoteBlock) => {
		const lines = quoteBlock.split('\n').map((line: string) => line.replace(/^>\s?/, '').trim());
		const content = lines.join(' ');
		return `${sep}<blockquote style="${mergedStyles.blockquote}">${content}</blockquote>`;
	});
}

function handleImages(html: string, mergedStyles: Required<CoffeeMarkdownStyles>): string {
	return html.replace(
		/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, // Only match up to whitespace or closing paren for the URL
		(_, alt, url) => {
			// Remove any accidental HTML tags from the URL (defensive)
			url = url.replace(/<.*$/, '');
			let src = url;
			if (src.startsWith('img-proxy:')) {
				const realUrl = src.replace(/^img-proxy:/, '');
				if (realUrl.length < 6) {
					src = '';
				} else {
					src = '/api/image-proxy?url=' + encodeURIComponent(realUrl);
				}
			}
			return `<img src="${src}" alt="${alt}" style="${mergedStyles.img}" crossorigin="anonymous" />`;
		}
	);
}

function handleLinks(html: string, mergedStyles: Required<CoffeeMarkdownStyles>): string {
	return html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" target="_blank" rel="noopener" style="${mergedStyles.a}">$1</a>`);
}

function handleBold(html: string, mergedStyles: Required<CoffeeMarkdownStyles>): string {
	return html.replace(/\*\*([\s\S]+?)\*\*/g, `<b style="${mergedStyles.b}">$1</b>`);
}

function handleUnderline(html: string): string {
  // Replace Markdown-style __text__ with styled <u>
  html = html.replace(/__([\s\S]+?)__/g, `<u style="text-decoration:underline;">$1</u>`);

  // Replace <u> tags even with whitespace or attributes
  html = html.replace(/<u(?:\s[^>]*)?>([\s\S]*?)<\/u>/gi, `<u style="text-decoration:underline;">$1</u>`);

  return html;
}

function handleItalic(html: string, mergedStyles: Required<CoffeeMarkdownStyles>): string {
	html = html.replace(/\*([\s\S]+?)\*/g, `<i style="${mergedStyles.i}">$1</i>`);
	html = html.replace(/_([\s\S]+?)_/g, `<i style="${mergedStyles.i}">$1</i>`);
	return html;
}

function handleEscapedNewlines(html: string): string {
	// Replace literal "\n" (backslash followed by n) with a <br> tag
	// We use \\n in the regex to match the literal backslash.
	return html.replace(/\\n/g, '<br>');
}

function handleParagraphs(html: string, mergedStyles: Required<CoffeeMarkdownStyles>): string {
	// Normalize blank lines first
	html = html.replace(/(?:\r?\n){2,}/g, '\n\n');

	// Process paragraphs: look for blocks of text separated by two or more newlines, or at the start of the string.
	// This regex captures the separator (if any) and the content of the "paragraph".
	// The content ([^\n<][^\n]*) can contain single newlines.
	return html.replace(/(^|(?:\n{2,}))([^\n<][^\n]*)/g, (m, sep, lineContent) => {
		// If the "lineContent" starts with an already-processed HTML block tag,
		// we don't want to wrap it in a <p> or process its newlines.
		if (/^\s*<(h\d|ul|ol|li|pre|blockquote|img|p|code|div|u|b|i)/.test(lineContent)) {
			return m;
		}

		// Within the lineContent (which is effectively a paragraph),
		// replace single newlines with <br>.
		// NOTE: This now handles PHYSICAL newlines. Literal \n was handled by handleEscapedNewlines.
		const processedLineContent = lineContent.trim().replace(/\n/g, '<br>');

		// Wrap the processed content in a paragraph tag.
		return `${sep}<p style="${mergedStyles.p}">${processedLineContent}</p>`;
	});
}

function processListItems(items: string[], isOrdered: boolean, mergedStyles: Required<CoffeeMarkdownStyles>, level = 0): string {
	return items.map((item: string, index: number) => {
		const nestedUl = item.match(/(\n\s*[-*] .+)/g);
		const nestedOl = item.match(/(\n\s*\d+\. .+)/g);
		const content = item.replace(/\n[\s\S]*/g, '').trim();
		let nested = '';
		if (nestedUl) {
			const nestedItems = nestedUl[0].trim().split(/\n\s*[-*] /).map((nestedItem: string, nestedIndex: number) => nestedIndex === 0 ? nestedItem.replace(/^[-*] /, '') : nestedItem);
			nested = `<ul style="${mergedStyles.ul}">${processListItems(nestedItems, false, mergedStyles, level + 1)}</ul>`;
		} else if (nestedOl) {
			const nestedItems = nestedOl[0].trim().split(/\n\s*\d+\. /).map((nestedItem: string, nestedIndex: number) => nestedIndex === 0 ? nestedItem.replace(/^\d+\. /, '') : nestedItem);
			nested = `<ol style="${mergedStyles.ol}">${processListItems(nestedItems, true, mergedStyles, level + 1)}</ol>`;
		}
		const bullet = isOrdered ? `<span style="margin-right:0.5em;color:#a5b4fc;">${index + 1}.</span>` : `<span style="margin-right:0.5em;color:#a5b4fc;">•</span>`;
		return `<li style="${mergedStyles.li}">${bullet}${content}${nested}</li>`;
	}).join('');
}

function handleUnorderedLists(html: string, mergedStyles: Required<CoffeeMarkdownStyles>): string {
	return html.replace(
		/(^|\n)((?:\s*[-*] .*(?:\n|$))+)/g,
		(match, sep, listBlock) => {
			const items = listBlock.trim().split(/\n\s*[-*] /).map((item: string, i: number) => i === 0 ? item.replace(/^[-*] /, '') : item);
			return `${sep}<ul style="${mergedStyles.ul}">${processListItems(items, false, mergedStyles)}</ul>`;
		}
	);
}

function handleOrderedLists(html: string, mergedStyles: Required<CoffeeMarkdownStyles>): string {
	return html.replace(
		/(^|\n)((?:\s*\d+\. .*(?:\n|$))+)/g,
		(match, sep, listBlock) => {
			const items = listBlock.trim().split(/\n\s*\d+\. /).map((item: string, i: number) => i === 0 ? item.replace(/^\d+\. /, '') : item);
			return `${sep}<ol style="${mergedStyles.ol}">${processListItems(items, true, mergedStyles)}</ol>`;
		}
	);
}

// New internal helper function to recursively process markdown within a block
// This function applies all parsing steps except `escapeHtml` and `handleColumns`
// to avoid double-escaping and infinite recursion.
function processMarkdownBlock(mdBlock: string, mergedStyles: Required<CoffeeMarkdownStyles>): string {
    let htmlBlock = mdBlock; // Assume already escaped by the main escapeHtml call

    htmlBlock = handleCodeBlocks(htmlBlock, mergedStyles);
    htmlBlock = handleInlineCode(htmlBlock, mergedStyles);
    htmlBlock = handleImages(htmlBlock, mergedStyles);
    htmlBlock = handleHeadings(htmlBlock, mergedStyles);
    htmlBlock = handleBlockquotes(htmlBlock, mergedStyles);
    htmlBlock = handleUnorderedLists(htmlBlock, mergedStyles);
    htmlBlock = handleOrderedLists(htmlBlock, mergedStyles);
    htmlBlock = handleLinks(htmlBlock, mergedStyles);
    htmlBlock = handleBold(htmlBlock, mergedStyles);
    htmlBlock = handleUnderline(htmlBlock);
    htmlBlock = handleItalic(htmlBlock, mergedStyles);
    htmlBlock = handleEscapedNewlines(htmlBlock);
    htmlBlock = handleParagraphs(htmlBlock, mergedStyles);
    htmlBlock = handleBgc(htmlBlock, mergedStyles);
    htmlBlock = handleCustom(htmlBlock, mergedStyles);
    htmlBlock = handleAlignment(htmlBlock, mergedStyles);

    return htmlBlock;
}

function handleColumns(html: string, mergedStyles: Required<CoffeeMarkdownStyles>): string {
    // Regex for <columns float="left|right" width="X%">...</columns>
    // Group 2: float direction (left|right)
    // Group 3: width (optional)
    // Group 4: entire content within <columns> tags
	return html.replace(
		/<columns\s+float=(["'])(left|right)\1(?:\s+width=(["'])(\d{1,2}(?:\.\d+)?%)\3)?>([\s\S]*?)<\/columns>/gi,
		(_, _quote1, floatDirection, _quote2, floatWidth = '40%', innerContent) => {
            const parts = innerContent.split(/(\n\s*---\s*\n)/); // Split by separator '---' on its own line

            let floatBlockMarkdown = '';
            let mainBlockMarkdown = '';

            if (parts.length >= 3) {
                // If separator found, first part is float content, rest is main content
                floatBlockMarkdown = parts[0].trim();
                mainBlockMarkdown = parts.slice(2).join('').trim();
            } else {
                // If no separator, treat entire content as mainBlock
                mainBlockMarkdown = innerContent.trim();
            }

            // Recursively process markdown within each block
            const processedFloatBlock = processMarkdownBlock(floatBlockMarkdown, mergedStyles);
            const processedMainBlock = processMarkdownBlock(mainBlockMarkdown, mergedStyles);

            const floatStyle = floatDirection === 'left' ? 'float:left; margin-right:1.5em;' : 'float:right; margin-left:1.5em;';
            const floatContainerStyle = `width:${floatWidth}; ${floatStyle} margin-bottom:0.7em;`;

			return `
<div style="${mergedStyles.section}">
    <div style="${floatContainerStyle}">
        ${processedFloatBlock}
    </div>
    <div style="overflow:hidden;">
        ${processedMainBlock}
    </div>
</div>`;
		}
	);
}