import webview
import os
from openai import OpenAI
from dotenv import load_dotenv
from recipe import Recipe


class API:
    def __init__(self):
        load_dotenv()
        api_key = os.environ.get("OPENAI_API_KEY")
        self.client = OpenAI()
        self.client.api_key = api_key
        self.model = "gpt-4.1-nano"

    def create_recipe(self, userPreferences, prompt):
        
        gptJob = """You are a chef who has expertise in making recipes, instructions, ingredients with nutrition facts, and a description of the food,
        for all types of food while accepting dietary restrictions from customers.
        Take these user restrictions and preferences for their dietary restrictions and kitchen equipment restrictions: """
        
        combinedPrompt = f"""{gptJob} {userPreferences} and apply it when making the recipe. Knowing these restrictions, make a recipe for this food: {prompt}
        and format the recipe, Description of the food, then the ingredients with nutrition facts, and finally the instructions for the recipe.
        Follow this order and format when returning:
        - Name: A short, descriptive name of the food/dish in "str" or string format
        - Ingredients: Make a bullet list of all the ingredients used for the dish, all in "str" or string format  
        - Nutrition: A bullet-list of all the nutrition facts of the dish, with a subheading labeled 'Nutrition Facts.' Make sure to make the list start underneath the label and move downward.
             - ServingsPerRecipe: The number of servings per recipe made with the given amout of ingredients
             - TotalCalories: The total amount of calories in one serving of the dish
             - TotalFat: The total amount of fat in one serving of the dish
             - SaturatedFat: The amount of saturated fat in one serving of the dish
             - Cholesterol: The amount of cholesterol in one serving of the dish
             - Sodium: The total amount of sodium in one serving of the dish
        - Description: A more in-depth description of the dish in paragraph form, all in "str" or string format
          total carbohydrate, fiber, total sugars, protien, calcium, and iron, all in "str" or string format
        - Time: Time it takes to make the dish in "str" or string format
        - Instructions: Write out the instructions to make the dish step-by step, with each step being part of a numbered list, again, all in "str" or string format"""

        response = self.client.beta.chat.completions.parse(
            model=self.model,
            messages=[
                {"role": "user", "content": combinedPrompt}
            ],
            response_format=Recipe
        )
        print(type(response))
        response = response.choices[0].message.parsed
        print(response)
        recipe_dict = {
            "name": response.name,
            "`ingredient`s": response.ingredients,
            "nutrition": {
                "cholesterol" : response.nutrition.Cholesterol,
                "sodium" : response.nutrition.Sodium,
                "servingsPerRecipe" : response.nutrition.ServingsPerRecipe,
                "totalCalories" : response.nutrition.TotalCalories,
                "totalFat" : response.nutrition.TotalFat,
                "saturatedFat" : response.nutrition.SaturatedFat,
            },
            "desc": response.desc,
            
            "time": response.time,
            "instructions": response.instructions
        }

        return recipe_dict

if __name__  == "__main__":
    api = API()
    pref = "not gluten"
    prompt = "Pasta"

    window = webview.create_window("WeCookin","static/index.html",js_api=api)
    webview.start(debug=True)
