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
        print(response.choices[0].message.content)

        return response.choices[0].message.content


if __name__  == "__main__":
    api = API()
    pref = "not gluten"
    prompt = "Pasta"

    window = webview.create_window("WeCookin","templates/index.html",js_api=api)
    webview.start(debug=True)

    print(api.create_recipe(pref, prompt))