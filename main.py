import webview
import os
from openai import OpenAI
from dotenv import load_dotenv
from recipe import Recipe
import json


class API:
    def __init__(self):
        load_dotenv()
        api_key = os.environ.get("OPENAI_API_KEY")
        self.client = OpenAI()
        self.client.api_key = api_key
        self.model = "gpt-5-nano"
        self.cookbookLocation = "storage/cookbook.json"
        self.settingLocation = "storage/preferences.json"
        self.kitchenLocation = "storage/kitchenRestrictions.json"
        self.processingRequest = False

    def create_recipe(self, user_preferences, prompt, kitchen_restrictions):
        print(prompt)
        print(type(prompt))
        
        if prompt == "":
            print("canceling request")
            return
        
        
        if self.processingRequest:
            return


        self.processingRequest = True

        gpt_job = "You are a chef who has expertise in making recipes, instructions, ingredients with nutrition facts, and a description of the food"
        
        if user_preferences != None:
            gpt_job += "for all types of food while accepting dietary restrictions from customers. Take these user restrictions and preferences for their dietary restrictions and kitchen equipment restrictions: "
        
        if kitchen_restrictions != None:
            gpt_job += "for all types of food while accepting kitchen equipment restrictions from customers. Take this kitchen equipment that the user doesn't have and apply it when making instructions: "
        
        gpt_job = f"""{gpt_job} {user_preferences} and apply it when making the recipe. Knowing these restrictions,
        make a recipe for this food: {prompt} and format the recipe, Description of the food, then the ingredients 
        with nutrition facts, and finally the instructions for the recipe. Unless the user requests for the dish to
        have certain restrictions, such as being vegetarian or vegan, do NOT create a vegetarian or vegan recipe.
        Keep it regular unless the user requests."""
        
        expected_format = """Follow this order and format when returning:
        - Name: A short, descriptive name of the food/dish in "str" or string format
        - Ingredients: Make a bullet list of all the ingredients used for the dish, all in "str" or string format  
        - Nutrition: A bullet-list of all the nutrition facts of the dish, with a subheading labeled 'Nutrition Facts.'
          Make sure to make the list start underneath the label and move downward.
             - ServingsPerRecipe: The number of servings per recipe made with the given amout of ingredients
             - TotalCalories: The total amount of calories in one serving of the dish
             - TotalFat: The total amount of fat in one serving of the dish
             - SaturatedFat: The amount of saturated fat in one serving of the dish
             - Cholesterol: The amount of cholesterol in one serving of the dish
             - Sodium: The total amount of sodium in one serving of the dish
        - Description: A more in-depth description of the dish in paragraph form, all in "str" or string format
          total carbohydrate, fiber, total sugars, protien, calcium, and iron, all in "str" or string format
        - Time: Time it takes to make the dish in "str" or string format
        - Instructions: Write out the instructions to make the dish step-by step, with each step being part of a list,
          again, all in "str" or string format. Do not put step numbers.
          Make sure to expand on each instruction and explain very in-depth what each step of making the dish involves"""
        
        example_1 = """{'name': 'Classic Fluffy Pancakes', 'ingredients': ['1 1/2 cups all-purpose flour', '3 1/2 teaspoons baking
        powder', '1 teaspoon salt', '1 tablespoon granulated sugar', '1 1/4 cups milk', '1 large egg', '3 tablespoons unsalted
        butter, melted'], 'nutrition': {'cholesterol': '50 mg per serving', 'sodium': '520 mg per serving', 'servingsPerRecipe':
        '4', 'totalCalories': '350 kcal per serving', 'totalFat': '14 g per serving', 'saturatedFat': '7 g per serving'},
        'desc': 'These classic fluffy pancakes are a perfect breakfast option, characterized by their light and airy texture.
        Made with simple pantry ingredients, they are quick to prepare and can be customized with toppings like fresh fruits, syrup,
        or whipped cream. This recipe yields four servings, making it ideal for family breakfasts or weekend brunches.', 'time': '20 minutes', 'instructions':
        ['In a large mixing bowl, sift together the all-purpose flour, baking powder, salt, and sugar. Use a fine-mesh sieve or sifter to ensure
        the mixture is well combined and free of lumps, which helps in making the pancakes fluffy.', 'Create a well in the center of the dry
        ingredients and pour in the milk, then add the egg and melted unsalted butter. Gently whisk the wet ingredients together with a fork
        or whisk just until the mixture is smooth and homogeneous. Be careful not to overmix, as this can activate gluten and make the pancakes
        dense.', "Preheat a non-stick skillet or griddle over medium heat. To test if it's hot enough, sprinkle a few drops of water onto the surface;
        if they dance and evaporate quickly, the skillet is ready.", 'Lightly grease the skillet with a small amount of butter or cooking spray. Use a ladle or
        measuring cup to pour about 1/4 cup of batter for each pancake onto the hot skillet, leaving space between pancakes to prevent them from merging.',
        'Cook the pancakes for about 2-3 minutes, or until bubbles form on the surface and the edges appear set. Carefully flip each pancake using a spatula and
        cook for an additional 2 minutes on the other side, until golden brown. Adjust the heat as needed to prevent burning while ensuring the pancakes cook
        through.', 'Transfer cooked pancakes to a plate. Keep warm by covering with a clean towel or placing in a preheated oven set to a low temperature while
        preparing remaining batter. Serve hot with your favorite toppings such as syrup, fresh berries, or whipped cream. Enjoy!']}"""
        
        example_2 = """{'name': 'Gluten-Free Homemade Pasta', 'ingredients': ['1 ½ cups gluten-free all-purpose flour (plus extra for dusting)', '3 large eggs',
        '1 tablespoon olive oil', '½ teaspoon salt'], 'nutrition': {'cholesterol': '35 mg per serving', 'sodium': '150 mg per serving', 'servingsPerRecipe':
        '4 servings', 'totalCalories': '210 kcal per serving', 'totalFat': '8 g per serving', 'saturatedFat': '1.2 g per serving'}, 'desc': 'This gluten-free homemade
        pasta recipe offers a tasty and satisfying alternative for those with gluten sensitivities or celiac disease. The dough is crafted from gluten-free all-purpose
        flour, eggs, olive oil, and salt, resulting in smooth, pliable pasta that can be rolled and cut into your desired shapes. Making pasta from scratch allows for
        a fresher taste and better control over ingredients, making it a delightful treat for the whole family.', 'time': '45 minutes', 'instructions':
        ['In a large mixing bowl, combine the gluten-free all-purpose flour and salt. Make a well in the center of the flour mixture to create a space for the wet
        ingredients.', 'Crack the eggs into the well, then add the olive oil. Using a fork, gently whisk the eggs and olive oil together, gradually incorporating
        the flour from the inside of the well to form a dough.', 'Once the mixture begins to come together, use your hands to knead the dough. Knead thoroughly for
        about 8-10 minutes until the dough is smooth, elastic, and slightly tacky but not sticky. If the dough is too sticky, sprinkle with a bit more flour; if too dry,
        add a small amount of water.', 'Wrap the dough in plastic wrap and let it rest at room temperature for 20 minutes. Resting helps relax the gluten-free flour particles,
        making the dough easier to roll out.', 'After resting, divide the dough into 2-4 equal portions to make rolling easier. Lightly dust your work surface and rolling
        pin with gluten-free flour.', 'Take one portion of dough and flatten it with your hands to form a disc. Using a rolling pin, roll out the dough into a thin sheet,
        approximately 1/16 inch thick. Rotate and flip the dough while rolling, adding a light dusting of flour as needed to prevent sticking.', 'Once the dough sheet is
        evenly thin and large enough to cut your desired pasta shapes, lightly dust it with gluten-free flour to prevent sticking.', 'Using a sharp knife or a pasta cutter,
        cut the dough into your preferred shapes, such as strips for fettuccine or squares for ravioli. Carefully transfer the cut pasta to a floured tray or a clean towel,
        keeping it separated to prevent sticking.', 'Repeat the rolling and cutting process with the remaining dough portions.', 'Bring a large pot of water to a boil and add
        a pinch of salt. Gently drop the fresh gluten-free pasta into boiling water and cook for about 2-3 minutes, or until the pasta floats to the surface and is al dente.',
        'Drain the cooked pasta in a colander and serve immediately with your favorite sauce or toppings. Enjoy your homemade gluten-free pasta!']}"""
        
        example_3 = """{'name': 'Keto Chocolate Brownies', 'ingredients': ['1/2 cup almond flour', '1/4 cup unsweetened cocoa powder', '1/4 teaspoon baking powder', '1/4 teaspoon salt',
        '3/4 cup erythritol or other keto-friendly sweetener', '2 large eggs', '1/4 cup unsalted butter, melted', '1 teaspoon vanilla extract', '1/4 cup sugar-free chocolate chips'],
        'nutrition': {'cholesterol': '40 mg per serving', 'sodium': '70 mg per serving', 'servingsPerRecipe': '16 servings', 'totalCalories': '150 kcal per serving', 'totalFat':
        '13 g per serving', 'saturatedFat': '5 g per serving'}, 'desc': 'These keto chocolate brownies are a rich, guilt-free dessert made with wholesome almond flour and sugar-free chocolate,
        perfect for satisfying your sweet tooth while adhering to a ketogenic lifestyle. They are dense, fudgy, and topped with a sprinkle of sugar-free chocolate chips, making them an ideal
        treat for dessert or snack time.', 'time': '30 minutes', 'instructions': ['Preheat your oven to 350°F (175°C). Line a baking dish with parchment paper or lightly grease it to prevent
        sticking.', 'In a medium bowl, whisk together almond flour, unsweetened cocoa powder, baking powder, and salt until well combined. This ensures an even distribution of dry ingredients
        for a uniform texture.', 'In a separate large bowl, beat the eggs until frothy. Add the melted butter, erythritol, and vanilla extract. Mix until smooth and well incorporated, creating
        a uniform wet mixture.', 'Gradually add the dry ingredients to the wet mixture, folding gently with a spatula until just combined. Do not overmix, as this could make the brownies dense.',
        'Fold in the sugar-free chocolate chips evenly throughout the batter, ensuring they are distributed throughout the mixture.', 'Pour the batter into the prepared baking dish, spreading it
        evenly with a spatula to ensure uniform thickness for even baking.', 'Place the baking dish in the preheated oven and bake for about 15-20 minutes. To check for doneness, insert a toothpick
        into the center; it should come out with moist crumbs but not wet batter.', 'Remove from oven and allow to cool in the dish for at least 10 minutes. Then, transfer to a wire rack to cool
        completely before slicing into squares.', 'Serve these decadent keto brownies alone or with a dollop of whipped cream or a few fresh berries for added flavor. Enjoy your sugar-free treat!']}"""
        
        examples =  f"""The following are examples of good formatting for different inputs from users. Use this as a reference or outline to help create your new responses based on user requests, however,
        do not directly copy these.:
        Example 1:
        Preferences: ""
        Prompt: "Fluffy pancakes"
        
        Response {example_1}
        
        Example 2:
        Preferences: "gluten-free" 
        Prompt: "homemade pasta"
        
        Response {example_2}
        
        Example 3:
        Preferences: "according to the ketogenic diet"
        Prompt: "brownies"
        
        Response {example_3}
        """
        
        combined_prompt = gpt_job + expected_format + examples
        
        response = self.client.beta.chat.completions.parse(
            model=self.model,
            messages=[
                {"role": "user", "content": combined_prompt}
            ],
            response_format=Recipe
        )
        # print(type(response))
        response = response.choices[0].message.parsed
        # print(response)
        recipe_dict = {
            "name": response.name,
            "ingredients": response.ingredients,
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

        self.processingRequest = False

        return recipe_dict
    
    @staticmethod
    def save_json(location, item):
        with open(location, "w+") as f:
            json.dump(item, f)

    @staticmethod
    def load_json(location):
        with open(location, "r") as f:
            return json.load(f)
    
    def save_recipe(self, recipe):
        self.save_json(self.cookbookLocation, recipe)

    def save_settings(self, settings):
        self.save_json(self.settingLocation, settings)

    def save_kitchen(self, kitchenItems):
        print("saving")
        self.save_json(self.kitchenLocation, kitchenItems)

    def load_recipes(self):
        recipes = self.load_json(self.cookbookLocation)
        return recipes

    def load_settings(self):
        return self.load_json(self.settingLocation)
    
    def load_kitchen(self):
        print("loading")
        return self.load_json(self.kitchenLocation)




if __name__  == "__main__":
    api = API()

    html_path = os.path.abspath("static/index.html")
    window = webview.create_window("WeCookin",html_path,js_api=api)
    webview.start(debug=True)
