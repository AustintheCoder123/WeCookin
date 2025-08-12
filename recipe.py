from pydantic import BaseModel

class Nutrition(BaseModel):
    ServingsPerRecipe: str
    TotalCalories: str
    TotalFat: str
    SaturatedFat: str
    Cholesterol: str
    Sodium: str

class Recipe(BaseModel):
    name: str
    ingredients: list[str]
    nutrition: Nutrition
    desc: str
    time: str
    instructions: list[str]

