
window.currentRecipe;
window.recipeDict = {};
window.settingsDict = {};
window.kitchenPrefsDict = {};


async function createRecipe() {
    let createButton = document.getElementById("createRecipeButton");
    let foodPrompt = document.getElementById("foodPrompt");
    let foodRecipe = foodPrompt.value;
    foodPrompt.value = "";

    if (foodRecipe == "")
        return;

    let restrictions = document.getElementById("restrictionsPrompt").value;

    let optionString = `This is the users dietary restrictions and preferences: ${settingsDict["allergens"]} and ${settingsDict["restrictions"]}.`;
    let combinedRestrictions = `${optionString} Also these are the users special requests for recipes: ${restrictions}.`;

    let kitchenRestrictions = `This is the users kitchen equipment that they don't have: ${kitchenPrefsDict["restrictions"]}.`;
    console.log(restrictions);
    createButton.disabled = true;

    document.getElementById("loadingDiv").style.display = "block";

    recipe = await pywebview.api.create_recipe(combinedRestrictions, foodRecipe, kitchenRestrictions);

    document.getElementById("loadingDiv").style.display = "none";

    window.currentRecipe = recipe;
    setRecipe(recipe);
    createButton.disabled = false;
}

function saveRecipe() {
    if (typeof window.recipeDict == "undefined") {
        window.recipeDict = {};
    }

    window.recipeDict[window.currentRecipe["name"]] = window.currentRecipe;
    newBookmark(currentRecipe);

    pywebview.api.save_recipe(recipeDict);
}

function setRecipe(displayRecipe) {
    if (displayRecipe) {
        document.getElementById("mainRecipeName").textContent = displayRecipe.name;

        // NUTRITION INFORMATION
        while (document.getElementById("mainRecipeNutrition").lastElementChild) {
            document.getElementById("mainRecipeNutrition").removeChild(document.getElementById("mainRecipeNutrition").lastElementChild);
        }
        let nutrition = displayRecipe.nutrition;

        createNutrientItem("Servings", nutrition.servingsPerRecipe);
        createNutrientItem("Time", displayRecipe.time);
        createNutrientItem("Calories", nutrition.totalCalories);
        createNutrientItem("Cholesterol", nutrition.cholesterol);
        createNutrientItem("Sodium", nutrition.sodium);
        createNutrientItem("Fat", nutrition.totalFat);
        createNutrientItem("Saturated fat", nutrition.saturatedFat);


        let description = document.createElement("p");
        while (document.getElementById("mainRecipeDescription").lastElementChild) {
            document.getElementById("mainRecipeDescription").removeChild(document.getElementById("mainRecipeDescription").lastElementChild);
        }
        description.innerText = displayRecipe.desc;
        document.getElementById("mainRecipeDescription").appendChild(description);

        // INGREDIENTS
        while (document.getElementById("mainRecipeIngredients").lastElementChild) {
            document.getElementById("mainRecipeIngredients").removeChild(document.getElementById("mainRecipeIngredients").lastElementChild);
        }
        for (let ingredient = 0; ingredient < displayRecipe.ingredients.length; ingredient++) {
            createIngredients(displayRecipe.ingredients[ingredient]);
        }

        // INSTRUCTIONS
        while (document.getElementById("mainRecipeInstructions").lastElementChild) {
            document.getElementById("mainRecipeInstructions").removeChild(document.getElementById("mainRecipeInstructions").lastElementChild);
        }
        for (let instruction = 0; instruction < displayRecipe.instructions.length; instruction++) {
            createInstructions(displayRecipe.instructions[instruction]);
        }
    }
}

function createNutrientItem(nutrient, value) {
    let nutritionDiv = document.createElement("div");
    let nutritionHead = document.createElement("h5")
    let nutritionText = document.createElement("p");

    nutritionHead.innerText = nutrient + ": ";
    nutritionText.innerText = value;
    nutritionDiv.className = "nutritionItem";
    

    document.getElementById("mainRecipeNutrition").appendChild(nutritionDiv);
    nutritionDiv.appendChild(nutritionHead);
    nutritionDiv.appendChild(nutritionText);
}

function createInstructions(instruction) {
    let instructionDiv = document.createElement("div");
    let instructionText = document.createElement("p");

    instructionDiv.className = "recipeInstructions"

    instructionText.innerText = instruction;
    instructionDiv.appendChild(instructionText);

    document.getElementById("mainRecipeInstructions").appendChild(instructionDiv);
}

function createIngredients(ingredient) {
    let ingredientDiv = document.createElement("div");
    let ingredientText = document.createElement("p");

    ingredientDiv.className = "mainRecipeIngredientItem";

    ingredientText.innerText = ingredient;
    ingredientDiv.appendChild(ingredientText);

    document.getElementById("mainRecipeIngredients").appendChild(ingredientDiv);
}

function recipeFromBar(name) {
    grabbed = window.recipeDict[name];
    setRecipe(grabbed);
}

function newBookmark(recipe) {
    checkDuplicateBookmarks(recipe);

    let bookmarkDiv = document.createElement("div");
    let textDiv = document.createElement("div");
    let buttonDiv = document.createElement("div");
    let bookmarkText = document.createElement("h3");
    let bookmarkDelete = document.createElement("button");

    bookmarkText.addEventListener('click', function () {
        setRecipe(recipeDict[bookmarkText.innerText]);
    });


    bookmarkText.innerText = recipe.name;
    bookmarkText.className = "savedRecipe";
    bookmarkDiv.className = "bookmarkRecipe";
    bookmarkDiv.value = recipe.name;
    bookmarkDelete.className = "deleteBookmark";

    bookmarkDelete.innerText = "X";

    bookmarkDelete.onclick = function () {
        checkDuplicateBookmarks(recipe);
        delete recipeDict[recipe.name];
        pywebview.api.save_recipe(recipeDict);
    };


    document.getElementById("bookmarkBar").appendChild(bookmarkDiv);
    bookmarkDiv.appendChild(textDiv);
    bookmarkDiv.appendChild(buttonDiv);
    textDiv.appendChild(bookmarkText);
    buttonDiv.appendChild(bookmarkDelete);

}

function checkDuplicateBookmarks(recipe) {
    const bookmarks = document.getElementsByClassName("bookmarkRecipe");

    for (let i = 0; i < bookmarks.length; i++) {
        if (bookmarks[i].value == recipe.name) {
            bookmarks[i].remove();
        }
    }
}

function openBookmark() {
    document.getElementById("bookmarkBar").style.width = "19%";
    document.getElementById("mainRecipePage").style.width = "80%";
    document.getElementById("options").style.paddingLeft = "70%";
}

function closeBookmark() {
    document.getElementById("bookmarkBar").style.width = "0";
    document.getElementById("mainRecipePage").style.width = "100%";
    document.getElementById("options").style.paddingLeft = "74%";
}

function openSettings() {
    let settings = document.getElementById("settings");
    settings.style.display = "flex";
}
function closeSettings() {
    let settings = document.getElementById("settings");
    settings.style.display = "none";
    setAllergens();
    setRestrictions();
    setKitchenPrefs();

    pywebview.api.save_settings(settingsDict);
    pywebview.api.save_kitchen(kitchenPrefsDict);
}

function addRestriction(item) {
    let restrictionItemDiv = document.createElement("div");
    let newRestrictionBox = document.createElement("input");
    let newRestrictionLabel = document.createElement("label");

    restrictionItemDiv.className = "restrictionItem";
    newRestrictionBox.type = "checkbox";
    newRestrictionBox.value = item;

    newRestrictionLabel.textContent = item;


    document.getElementById("restrictionItems").appendChild(restrictionItemDiv);
    restrictionItemDiv.appendChild(newRestrictionBox);
    restrictionItemDiv.appendChild(newRestrictionLabel);

}

function addAllergen(item) {
    let allergenItemDiv = document.createElement("div");
    let textDiv = document.createElement("div");
    let buttonDiv = document.createElement("div");
    let newAllergenBox = document.createElement("input");
    let newAllergenLabel = document.createElement("label");
    let itemDelete = document.createElement("button");


    allergenItemDiv.className = "allergenItem";
    newAllergenBox.type = "checkbox";
    newAllergenBox.value = item;
    itemDelete.className = "deleteBookmark";

    itemDelete.innerText = "X";

    newAllergenLabel.textContent = item;

    

    itemDelete.onclick = function () {
        const items = document.getElementsByClassName("allergenItems");

        for (let i = 0; i < items.length; i++) {
            if (items[i].value == item) {
            items[i].remove();
            }
        }
        delete recipeDict[recipe.name];
    };

    document.getElementById("allergenItems").appendChild(allergenItemDiv);
    allergenItemDiv.appendChild(textDiv);
    allergenItemDiv.appendChild(buttonDiv);
    textDiv.appendChild(newAllergenBox);
    textDiv.appendChild(newAllergenLabel);
    buttonDiv.appendChild(itemDelete);
}

function addKitchenPref(item) {
    let allergenItemDiv = document.createElement("div");
    let newAllergenBox = document.createElement("input");
    let newAllergenLabel = document.createElement("label");

    allergenItemDiv.className = "kitchenItem";
    newAllergenBox.type = "checkbox";
    newAllergenBox.value = item;

    newAllergenLabel.textContent = item;

    document.getElementById("kicthenPrefsSubDiv").appendChild(allergenItemDiv);
    allergenItemDiv.appendChild(newAllergenBox);
    allergenItemDiv.appendChild(newAllergenLabel);
}

function setAllergens() {
    let buttonsInDiv = document.getElementById("allergenItems").querySelectorAll("input");
    let allergensList = [];

    buttonsInDiv.forEach(element => {
        if (element.checked) {
            allergensList.push(element.value);
        }
    });

    settingsDict["allergens"] = allergensList.join(", ");
}

function setRestrictions() {
    let buttonsInDiv = document.getElementById("restrictionItems").querySelectorAll("input");
    let restrictionsList = [];

    buttonsInDiv.forEach(element => {
        if (element.checked) {
            restrictionsList.push(element.value);
        }
    });

    settingsDict["restrictions"] = restrictionsList.join(", ");
}

function loadAllergens() {
    let allergenList = settingsDict["allergens"].split(", ");
    let buttonsInDiv = document.getElementById("allergenItems").querySelectorAll("input");

    buttonsInDiv.forEach(element => {
        for (let i = 0; i < allergenList.length; i++) {
            if (element.value == allergenList[i]) {
                element.checked = true;
            }
        }
    });
}

function loadRestrictions() {
    let restrictionList = settingsDict["restrictions"].split(", ");
    let buttonsInDiv = document.getElementById("restrictionItems").querySelectorAll("input");

    let temp = 0;
    buttonsInDiv.forEach(element => {
        for (let i = 0 + temp; i < restrictionList.length; i++) {
            if (element.value == restrictionList[i]) {
                element.checked = true;
                temp++;
            }
        }
    });
    temp = 0;
}

function switchUserPrefs(){
    let userPrefs = document.getElementById("userPrefs");
    let kitchenPrefs = document.getElementById("kitchenPrefs");
    
    if(userPrefs.style.display == "none"){
        userPrefs.style.display = "inline-block";
        kitchenPrefs.style.display = "none";
    }
    else if(kitchenPrefs.style.display != "none"){
        userPrefs.style.display = "none";
    }
}



function switchKitchenPrefs(){
    let userPrefs = document.getElementById("userPrefs");
    let kitchenPrefs = document.getElementById("kitchenPrefs");
    
    if(kitchenPrefs.style.display == "none"){
        kitchenPrefs.style.display = "inline-block";
        userPrefs.style.display = "none";
    }
    else if(userPrefs.style.display != "none"){
        kitchenPrefs.style.display = "none";
    }
}

function loadKitchenPrefs(){
    let restrictionList = kitchenPrefsDict["restrictions"].split(", ");
    let buttonsInDiv = document.getElementById("kitchenPrefs").querySelectorAll("input");

    let temp = 0;
    buttonsInDiv.forEach(element => {
        for (let i = 0 + temp; i < restrictionList.length; i++) {
            if (element.value == restrictionList[i]) {
                element.checked = true;
                temp++;
            }
        }
    });
    temp = 0;
}

function setKitchenPrefs(){
    let buttonsInDiv = document.getElementById("kitchenPrefs").querySelectorAll("input");
    let restrictionsList = [];

    buttonsInDiv.forEach(element => {
        if (element.checked) {
            restrictionsList.push(element.value);
        }
    });

    kitchenPrefsDict["restrictions"] = restrictionsList.join(", ");
}


//Event Listeners------------------------------------------

let restrictionsInput = document.getElementById("otherRestriction");
let allergensInput = document.getElementById("otherAllergen");
let kitchenInput = document.getElementById("otherKitchenItem");
let recipeInput = document.getElementById("foodPrompt");

restrictionsInput.addEventListener("keypress", function (event) {
    if (event.key == "Enter") {
        event.preventDefault();
        addRestriction(restrictionsInput.value);
        restrictionsInput.value = "";
    }
});

allergensInput.addEventListener("keypress", function (event) {
    if (event.key == "Enter") {
        event.preventDefault();
        addAllergen(allergensInput.value);
        allergensInput.value = "";
    }
});

kitchenInput.addEventListener("keypress", function (event) {
    if (event.key == "Enter") {
        event.preventDefault();
        addKitchenPref(kitchenInput.value);
        kitchenInput.value = "";
    }
});



recipeInput.addEventListener("keypress", function (event) {
    if (event.key == "Enter") {
        event.preventDefault();
        createRecipe();
        recipeInput.value = "";
    }
});




window.addEventListener('pywebviewready', async () => {
    if (pywebview.api.init) {
        await pywebview.api.init();
    }
    recipeDict = await pywebview.api.load_recipes();
    settingsDict = await pywebview.api.load_settings();
    kitchenPrefsDict = await pywebview.api.load_kitchen();

    loadAllergens();
    loadRestrictions();
    loadKitchenPrefs();

    for (const key in recipeDict) {
        newBookmark(recipeDict[key]);
    }
});



