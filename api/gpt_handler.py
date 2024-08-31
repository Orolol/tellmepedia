import os
from openai import OpenAI
from dotenv import load_dotenv
import nltk
from nltk.tokenize import sent_tokenize

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def split_content_into_chunks(content):
    nltk.download('punkt', quiet=True)
    sentences = sent_tokenize(content)
    return sentences

def rewrite_content_with_gpt4(content):
    system_message = "You are a helpful assistant that rewrites Wikipedia content for audio narration."
    user_instructions = """
    Rewrite the following Wikipedia content:
    - Make it suitable for oral reading and more entertaining to listen to.
    - Make it informative and engaging, like a podcast or documentary.
    - Preserve all information, details.
    - Preserve the original language of the article.
    - Remove empty categories or chapters.
    - Exclude Wikipedia-specific categories like "See also" or other references.
    """
    
    initial_prompt = f"{user_instructions}\n\nOriginal Article:\n{content}"
    
    rewritten_content = ""
    
    while True:
        response = client.chat.completions.create(
            model="gpt-4o-2024-08-06",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": initial_prompt if not rewritten_content else "Please continue"},
                *([] if not rewritten_content else [{"role": "assistant", "content": rewritten_content}])
            ],
            n=1,
            temperature=0.7,
        )
        
        rewritten_content += response.choices[0].message.content.strip()
        
        if response.choices[0].finish_reason != "length":
            break
    
    return rewritten_content
