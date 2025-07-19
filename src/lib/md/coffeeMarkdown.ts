// most of this script has been fed through AI because I have no clue how to handle Regex and I hate Regex
// if you find any problems here, blame the machine.

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
	poetry?: string; // Add poetry style for <poetry> blocks
	table?: string; // Table style
	th?: string;    // Table header cell style
	td?: string;    // Table data cell style
	checkbox?: string; // Style for rendered checkboxes
	background?: string; // Style for <background> tag
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
	poetry: 'font-family:serif;font-style:italic;white-space:pre-line;padding:1em 1.5em;margin:1.2em 0;line-height:1.7;', // Default poetry style
	table: 'border-collapse:collapse;width:100%;margin:1.2em 0;background:var(--color-bg-alt);border-radius:8px;overflow:hidden;box-shadow:0 1px 4px var(--color-card-shadow);',
	th: 'padding:0.6em 1em;background:var(--color-link);color:#fff;font-weight:700;text-align:left;border-bottom:2px solid var(--color-link);',
	td: 'padding:0.6em 1em;border-bottom:1px solid var(--color-bg);',
	checkbox: 'display:inline-block;width:1.1em;height:1.1em;margin-right:0.5em;vertical-align:-0.15em;border:2px solid var(--color-link);border-radius:4px;background:var(--color-bg);',
	background: '', // Default style for <background>
};

//background-image: url('https://wallpaperaccess.com/full/781336.jpg')

export function coffeeMarkdown(md: string, styles: CoffeeMarkdownStyles = {}): string {
	const mergedStyles = { ...defaultStyles, ...styles };

	if (!md || typeof md !== 'string') {
		console.error('Invalid markdown input:', md);
		return '';
	}

	md = md.replace(/\r\n?/g, '\n');

	let html = escapeHtml(md);

	// 1. Custom block containers
	html = handleColumns(html, mergedStyles);
	html = handleBgc(html, mergedStyles);
	html = handleBackground(html, mergedStyles);
	html = handleCustom(html, mergedStyles);
	html = handleAlignment(html, mergedStyles);

	// 2. Standard block elements
	html = handleTables(html, mergedStyles);
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
	html = handlePoetry(html, mergedStyles);

	html = handleCheckboxes(html, mergedStyles);

	return html;
}

function escapeHtml(md: string): string {
	const allowedTags = ['u', 'b', 'i', 'code', 'pre', 'custom', 'bgc', 'url', 'br', 'align', 'columns', 'poetry', 'background'];

	return md.replace(/<([^>]+)>/g, (match, tagContent) => {
		const tagNameMatch = tagContent.match(/^\/?(\w+)/);
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

			switch (alignValue) {
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
		.replace(/^#{6} (.*)$/gm, `<h6 style="${mergedStyles.h6}">$1</h6>`)
		.replace(/^#{5} (.*)$/gm, `<h5 style="${mergedStyles.h5}">$1</h5>`)
		.replace(/^#{4} (.*)$/gm, `<h4 style="${mergedStyles.h4}">$1</h4>`)
		.replace(/^### (.*)$/gm, `<h3 style="${mergedStyles.h3}">$1</h3>`)
		.replace(/^## (.*)$/gm, `<h2 style="${mergedStyles.h2}">$1</h2>`)
		.replace(/^# (.*)$/gm, `<h1 style="${mergedStyles.h1}">$1</h1>`);
}

function handleBlockquotes(html: string, mergedStyles: Required<CoffeeMarkdownStyles>): string {
	return html.replace(/(^|\n)(>\N*(?:\n>\N*)*)/g, (match, sep, quoteBlock) => {
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
	// This function ensures that every single newline inside a paragraph is replaced with <br>,
	// and paragraphs are created for blocks separated by two or more newlines.

	// Normalize blank lines first
	html = html.replace(/(?:\r?\n){2,}/g, '\n\n');

	// Process paragraphs: look for blocks of text separated by two or more newlines, or at the start of the string.
	return html.replace(/(^|(?:\n{2,}))(\N+(?:[\n]\N+)*)/g, (m, sep, lineContent) => {
		// Replace single newlines with <br> within the paragraph
		const processedLineContent = lineContent.trim().replace(/\n/g, '<br>');
		return `${sep}<p style="${mergedStyles.p}">${processedLineContent}</p>`;
	});
}

function processListItems(items: string[], isOrdered: boolean, mergedStyles: Required<CoffeeMarkdownStyles>, level = 0): string {
	return items.map((item: string, index: number) => {
		const nestedUl = item.match(/(\n\s*[-*] .+)/g);
		const nestedOl = item.match(/(\n\s*\d+\. .+)/g);
		let content = item.replace(/\n[\s\S]*/g, '').trim();
		let nested = '';
		if (nestedUl) {
			const nestedItems = nestedUl[0].trim().split(/\n\s*[-*] /).map((nestedItem: string, nestedIndex: number) => nestedIndex === 0 ? nestedItem.replace(/^[-*] /, '') : nestedItem);
			nested = `<ul style="${mergedStyles.ul}">${processListItems(nestedItems, false, mergedStyles, level + 1)}</ul>`;
		} else if (nestedOl) {
			const nestedItems = nestedOl[0].trim().split(/\n\s*\d+\. /).map((nestedItem: string, nestedIndex: number) => nestedIndex === 0 ? nestedItem.replace(/^\d+\. /, '') : nestedItem);
			nested = `<ol style="${mergedStyles.ol}">${processListItems(nestedItems, true, mergedStyles, level + 1)}</ol>`;
		}
		const bullet = isOrdered ? `<span style="margin-right:0.5em;color:#a5b4fc;">${index + 1}.</span>` : `<span style="margin-right:0.5em;color:#a5b4fc;">•</span>`;

		// Checkbox detection at the start of the content
		let checkbox = '';
		const checkboxMatch = content.match(/^\[([ xX])\]\s*/);
		if (checkboxMatch) {
			const isChecked = checkboxMatch[1].toLowerCase() === 'x';
			checkbox = `<span style="${mergedStyles.checkbox};background:${isChecked ? 'var(--color-link);color:#fff;' : 'var(--color-bg);'};text-align:center;">${isChecked ? '&#10003;' : ''}</span>`;
			content = content.replace(/^\[[ xX]\]\s*/, '');
		}

		return `<li style="${mergedStyles.li}">${bullet}${checkbox}${processInlineMarkdown(content, mergedStyles)}${nested}</li>`;
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

function handleCheckboxes(html: string, mergedStyles: Required<CoffeeMarkdownStyles>): string {
	// Replace - [ ] and - [x] or - [X] at the start of <li> content
	return html.replace(/<li([^>]*)>(\s*)\[([ xX])\](\s*)([\s\S]*?)<\/li>/g, (_m, liAttrs, preSpace, checked, postSpace, content) => {
		const isChecked = checked.toLowerCase() === 'x';
		const checkbox = `<span style="${mergedStyles.checkbox};background:${isChecked ? 'var(--color-link);color:#fff;' : 'var(--color-bg);'};text-align:center;">${isChecked ? '&#10003;' : ''}</span>`;
		return `<li${liAttrs}>${preSpace}${checkbox}${postSpace}${content}</li>`;
	});
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

function handlePoetry(html: string, mergedStyles: Required<CoffeeMarkdownStyles>): string {
	return html.replace(
		/<poetry>([\s\S]*?)<\/poetry>/gi,
		(_, content) => {
			// Remove leading/trailing newlines, preserve internal whitespace and line breaks
			const cleaned = content.replace(/^\n+|\n+$/g, '');
			// Remove any <p> tags that may have been added inside poetry
			const noPTags = cleaned.replace(/<p[^>]*>/gi, '').replace(/<\/p>/gi, '');
			return `<div style="${mergedStyles.poetry}">${noPTags}</div>`;
		}
	);
}

function handleTables(html: string, mergedStyles: Required<CoffeeMarkdownStyles>): string {
	// Regex to match markdown tables (header, separator, at least one row)
	const tableRegex = /(^|\n)(\|\N+\|[ \t]*\n\|[ \t]*(:?-+:?\|)+[ \t]*\n(?:\|\N+\|[ \t]*(?:\n|$))+)/gm;

	return html.replace(tableRegex, (match: string, sep: string, tableBlock: string) => {
		const lines: string[] = tableBlock.trim().split(/\n/).map((l: string) => l.trim());
		if (lines.length < 2) return match; // Not a valid table

		const header: string = lines[0];
		const alignLine: string = lines[1];
		const rows: string[] = lines.slice(2);

		const headers: string[] = header.split('|').slice(1, -1).map((h: string) => processInlineMarkdown(h.trim(), mergedStyles));
		const aligns: (string | undefined)[] = alignLine.split('|').slice(1, -1).map((a: string) => {
			if (/^:-+:$/.test(a.trim())) return 'center';
			if (/^-+:$/.test(a.trim())) return 'right';
			if (/^:-+$/.test(a.trim())) return 'left';
			return undefined;
		});

		const rowCells: string[][] = rows.map((row: string) => row.split('|').slice(1, -1).map((cell: string) => processInlineMarkdown(cell.trim(), mergedStyles)));

		const thead = `<thead><tr>${headers.map((h: string, i: number) => `<th style="${mergedStyles.th}${aligns[i] ? `text-align:${aligns[i]};` : ''}">${h}</th>`).join('')}</tr></thead>`;
		const tbody = `<tbody>${rowCells.map((cells: string[]) => `<tr>${cells.map((cell: string, i: number) => `<td style="${mergedStyles.td}${aligns[i] ? `text-align:${aligns[i]};` : ''}">${cell}</td>`).join('')}</tr>`).join('')}</tbody>`;

		return `${sep}<table style="${mergedStyles.table}">${thead}${tbody}</table>`;
	});
}

function renderCheckboxesInline(text: string, mergedStyles: Required<CoffeeMarkdownStyles>): string {
	// Only replace [ ] or [x]/[X] at the start of a line (not inside <li> for lists)
	return text.replace(/(^|\s)\[([ xX])\](?=\s|$)/g, (m, pre, checked) => {
		const isChecked = checked.toLowerCase() === 'x';
		const checkbox = `<span style="${mergedStyles.checkbox};background:${isChecked ? 'var(--color-link);color:#fff;' : 'var(--color-bg);'};text-align:center;">${isChecked ? '&#10003;' : ''}</span>`;
		return `${pre}${checkbox}`;
	});
}

function processInlineMarkdown(text: string, mergedStyles: Required<CoffeeMarkdownStyles>): string {
	let html = text;
	html = renderCheckboxesInline(html, mergedStyles);
	html = handleLinks(html, mergedStyles);
	html = handleBold(html, mergedStyles);
	html = handleUnderline(html);
	html = handleItalic(html, mergedStyles);
	html = handleEscapedNewlines(html);
	return html;
}

function handleBackground(html: string, mergedStyles: Required<CoffeeMarkdownStyles>): string {
	return html.replace(
		/<background(?:\s+([^>]*?))?>([\s\S]*?)<\/background>/gi,
		(_, attrs = '', content) => {
			attrs = attrs.trim();
			let bg = '';
			let img = '';
			let gradient = '';
			let text = '';
			// Support quoted or unquoted values, and allow colons/slashes in URLs
			const bgMatch = attrs.match(/color\s*:\s*(?:"([^"]+)"|'([^']+)'|([^\s;]+))/i);
			const imgMatch = attrs.match(/image\s*:\s*(?:"([^"]+)"|'([^']+)'|([^\s;]+))/i);
			const gradMatch = attrs.match(/gradient\s*:\s*(?:"([^"]+)"|'([^']+)'|([^\s;]+))/i);
			const textMatch = attrs.match(/text\s*:\s*(?:"([^"]+)"|'([^']+)'|([^\s;]+))/i);
			if (bgMatch) bg = bgMatch[1] || bgMatch[2] || bgMatch[3] || '';
			if (imgMatch) img = imgMatch[1] || imgMatch[2] || imgMatch[3] || '';
			if (gradMatch) gradient = gradMatch[1] || gradMatch[2] || gradMatch[3] || '';
			if (textMatch) text = textMatch[1] || textMatch[2] || textMatch[3] || '';
			const userStyle = [
				bg ? `background:${bg};` : '',
				gradient ? `background-image:${gradient};` : '',
				img ? `background-image:url('${img}');background-size:cover;background-position:center;` : '',
				text ? `color:${text};` : ''
			].join('');
			const style = `${mergedStyles.background}${userStyle}`;
			return `<div style="${style}">${content}</div>`;
		}
	);
}
