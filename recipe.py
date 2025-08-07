from pydantic import BaseModel

class Recipe(BaseModel):
    name: str
    ingredients: list[str]
    nutrition: str
    desc: str
    time: int
    instructions: str