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
        
        gptJob = """You are a chef who has expertise in making recipes, instructions, ingredients with nutrition facts, and a description of the food,
        for all types of good while acpeting dietary restrictions from customers.
        Take these user restrictions and preferences for their dietary restrictions and kitchen equipment restrictions: """
        
        combinedPrompt = f"""{gptJob} {userPreferences} and apply it when making the recipe. Knowing these restrictions make a recipe for this food: {prompt}
        and format the recipe, Description of the food, then the ingredients with nutrition facts, and finally the instructions for the recipe."""

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
