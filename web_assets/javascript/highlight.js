function loadHighlightJs() {
	// const link = document.createElement('link');
	// link.rel = 'stylesheet';
	// link.href = 'https://cdn.jsdelivr.net/npm/highlight.js@11.10.0/styles/atom-one-dark.min.css';
	// document.head.appendChild(link);
	
	const script = document.createElement('script');
	script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js';
	script.onload = function() {
		const javaScript = document.createElement('script');
		javaScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/languages/javascript.min.js';
		javaScript.onload = function() {
			hljs.highlightAll();
		};
		document.body.appendChild(javaScript);
	};
	try {
		document.body.appendChild(script);
	} catch (e) {
		window.addEventListener('load', () => {
			document.body.appendChild(script);
		})
	}
}

loadHighlightJs();
