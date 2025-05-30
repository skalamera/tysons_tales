import os
from dotenv import load_dotenv

# Load environment variables from .env file in development
load_dotenv()

# Get the OpenAI API key from environment variables
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Validate that the API key is present
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is not set") 