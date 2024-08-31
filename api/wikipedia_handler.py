import wikipedia

def extract_wiki_content(title, lang='en'):
    try:
        wikipedia.set_lang(lang)
        page = wikipedia.page(title, auto_suggest=False)
        return page.content
    except wikipedia.exceptions.DisambiguationError as e:
        return f"Error: Ambiguous page. Possible options: {e.options}"
    except wikipedia.exceptions.PageError:
        return "Error: Page not found"
