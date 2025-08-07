import pydantic

class Recipe:
    def __init__(self):
        self.name: str
        self.ingredients: list[str]
        self.nutrition: str
        self.desc: str
        self.time: int
        self.instructions: list[str]