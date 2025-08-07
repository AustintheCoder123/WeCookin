import webview
import os
from openai import OpenAI
from dotenv import load_dotenv


class API:
    def __init__(self):
        load_dotenv()
        api_key = os.environ.get("OPENAI_API_KEY")
        self.client = OpenAI()
        self.client.api_key = api_key
        self.model = "gpt-4.1-nano"

    def create_recipe(self, userPreferences, prompt):

