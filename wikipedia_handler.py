import wikipedia

def get_wikipedia_summary(query, sentences=2, lang='en'):
    try:
        wikipedia.set_lang(lang)
        return wikipedia.summary(query, sentences=sentences)
    except wikipedia.exceptions.DisambiguationError as e:
        return f"DisambiguationError: {e.options}"
    except wikipedia.exceptions.PageError:
        return "PageError: The page does not exist."
    except wikipedia.exceptions.WikipediaException:
        return f"Invalid language code: {lang}"
    except Exception as e:
        return f"An error occurred: {str(e)}"

def extract_wiki_content(title, lang='en'):
    try:
        wikipedia.set_lang(lang)
        page = wikipedia.page(title, auto_suggest=False)
        return page.content
    except wikipedia.exceptions.DisambiguationError as e:
        return f"Error: Ambiguous page. Possible options: {e.options}"
    except wikipedia.exceptions.PageError:
        return "Error: Page not found"
