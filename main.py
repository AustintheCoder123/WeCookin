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
        gptJob = "Your job is to create a recipe based on the user preferences: "
        combinedPrompt = gptJob+ userPreferences+ ", and what they ask for: " + prompt

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "user", "content": combinedPrompt}
            ]
        )

        return response.choices[0].message.content

a = API()
if __name__  == "__main__":
    pref = "not gluten"
    prompt = "Pasta"
    print(a.create_recipe(pref, prompt))