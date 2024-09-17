import os
from dotenv import load_dotenv
import nltk
from nltk.tokenize import sent_tokenize
from llama_cpp import Llama

load_dotenv()

# Initialize the Llama model
llm = Llama.from_pretrained(
    repo_id="bartowski/Meta-Llama-3.1-8B-Instruct-GGUF",
    filename="Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf",
    verbose=True,
    n_ctx=8192,
)

def split_content_into_chunks(content):
    nltk.download('punkt', quiet=True)
    sentences = sent_tokenize(content)
    return sentences

def rewrite_content_with_llama(content):
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
    current_prompt = initial_prompt
    
    while True:
        response = llm.create_chat_completion(
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": current_prompt}
            ],
            max_tokens=4096,  # Adjust as needed
            temperature=0.7,
            
        )
        
        new_text = response["choices"][0]["message"]["content"].strip()
        rewritten_content += new_text
        
        if len(new_text) < 512:  # Adjust condition as needed
            break
        
        current_prompt = f"{initial_prompt}\n\n{rewritten_content}\n\nPlease continue"
    
    return rewritten_content
