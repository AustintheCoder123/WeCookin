window.currentRecipe;
window.recipeDict = {};
window.settingsDict = {};
window.kitchenPrefsDict = {};
window.recipeOptions = [];


async function createRecipe() {
    let createButton = document.getElementById("createRecipeButton");
    let foodPrompt = document.getElementById("foodPrompt");
    let foodRecipe = foodPrompt.value;
    foodPrompt.value = "";

    if (foodRecipe == "") {
        return;
    }

    const allergens = (settingsDict?.allergens || "").trim();
    const diet = (settingsDict?.restrictions || "").trim();
    const kitchen = (kitchenPrefsDict?.restrictions || "").trim();

    const optionString = `This is the user's dietary restrictions and preferences: ${[allergens, diet].filter(Boolean).join(", ")
        }.`.replace(": .", ": (none).");


    const kitchenRestrictions = kitchen
        ? `This is the user's kitchen equipment that they don't have: ${kitchen}.`
        : `This is the user's kitchen equipment that they don't have: (none).`;

    createButton.disabled = true;
    document.getElementById("loadingDiv").style.display = "block";

    let options = await pywebview.api.create_recipe_options(optionString, foodRecipe, kitchenRestrictions, 3);

    document.getElementById("loadingDiv").style.display = "none";
    createButton.disabled = false;

    if (!options || !Array.isArray(options) || options.length === 0) return;

    window.recipeOptions = options;
    showRecipeOptions(options);
}

function showRecipeOptions(options) {
    const grid = document.getElementById("recipeOptions");
    grid.innerHTML = "";
    grid.style.display = "grid";

    // Hide the detailed recipe view until user picks one
    const body = document.querySelector(".recipeBody");
    if (body) body.style.display = "none";

    options.forEach((r, idx) => {
        const card = document.createElement("div");
        card.className = "recipeCard";

        const title = document.createElement("h3");
        title.textContent = r.name || `Option ${idx + 1}`;

        const time = document.createElement("p");
        time.className = "recipeCardTime";
        time.textContent = r.time ? `Time: ${r.time}` : "";

        const desc = document.createElement("p");
        desc.className = "recipeCardDesc";
        desc.textContent = r.desc || "";

        const btn = document.createElement("button");
        btn.className = "recipeCardButton";
        btn.textContent = "View recipe";
        btn.addEventListener("click", () => selectRecipe(idx));

        card.appendChild(title);
        card.appendChild(time);
        card.appendChild(desc);
        card.appendChild(btn);
        grid.appendChild(card);
    });
}

function selectRecipe(index) {
    const chosen = window.recipeOptions[index];
    if (!chosen) return;

    // Show detailed recipe view
    const body = document.querySelector(".recipeBody");
    if (body) body.style.display = "block";

    // Hide the cards
    const grid = document.getElementById("recipeOptions");
    grid.style.display = "none";

    window.currentRecipe = chosen;
    setRecipe(chosen);
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
        let clear = document.getElementsByClassName("recipeBody");
        let placeholder = document.createElement("p");

        console.log(document.getElementById("mainRecipeName"));
        document.getElementById("mainRecipeName").appendChild(placeholder); // Lines 51-52 are to avoid a reading null error
        for (let i = 0; i < clear.length; i++) {
            while (clear[i].lastElementChild) {
                clear[i].removeChild(clear[i].lastElementChild);
            }
        }
        console.log(document.getElementById("mainRecipeName"));

        let mainRecipeName = document.createElement("div");
        mainRecipeName.id = "mainRecipeName";
        let addToRecipeBody = document.getElementsByClassName("recipeBody");
        for (let i = 0; i < addToRecipeBody.length; i++) {
            addToRecipeBody[i].appendChild(mainRecipeName);
        }

        document.getElementById("mainRecipeName").textContent = displayRecipe.name;
        console.log(document.getElementById("mainRecipeName"));


        // NUTRITION INFORMATION
        let mainRecipeNutrition = document.createElement("div");
        mainRecipeNutrition.id = "mainRecipeNutrition";
        for (let i = 0; i < addToRecipeBody.length; i++) {
            addToRecipeBody[i].appendChild(mainRecipeNutrition);
        }


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

        let flexContainer = document.createElement("div");
        flexContainer.className = "flexContainer";
        for (let i = 0; i < addToRecipeBody.length; i++) {
            addToRecipeBody[i].appendChild(flexContainer);
        }

        let box1 = document.createElement("div");
        box1.id = "box1";
        let addFlexContainer = document.getElementsByClassName("flexContainer");
        for (let i = 0; i < addFlexContainer.length; i++) {
            addFlexContainer[i].appendChild(box1);
        }
        let mainRecipeDescription = document.createElement("div");
        mainRecipeDescription.id = "mainRecipeDescription";
        document.getElementById("box1").appendChild(mainRecipeDescription);

        let mainRecipeIngredients = document.createElement("div");
        mainRecipeIngredients.id = "mainRecipeIngredients";
        for (let i = 0; i < addFlexContainer.length; i++) {
            addFlexContainer[i].appendChild(mainRecipeIngredients);
        }

        let description = document.createElement("p");
        let avoidError = document.createElement("p");
        document.getElementById("mainRecipeDescription").appendChild(avoidError); //This is just a line of code so that the next line doesn't return an error
        while (document.getElementById("mainRecipeDescription").lastElementChild) {
            document.getElementById("mainRecipeDescription").removeChild(document.getElementById("mainRecipeDescription").lastElementChild);
        }
        description.innerText = displayRecipe.desc;
        mainRecipeDescription.appendChild(description)

        // INGREDIENTS
        document.getElementById("mainRecipeIngredients").appendChild(avoidError); //This is just a line of code so that the next line doesn't return an error
        while (document.getElementById("mainRecipeIngredients").lastElementChild) {
            document.getElementById("mainRecipeIngredients").removeChild(document.getElementById("mainRecipeIngredients").lastElementChild);
        }
        for (let ingredient = 0; ingredient < displayRecipe.ingredients.length; ingredient++) {
            createIngredients(displayRecipe.ingredients[ingredient]);
        }

        // INSTRUCTIONS
        let mainRecipeInstructions = document.createElement("div");
        mainRecipeInstructions.id = "mainRecipeInstructions";
        for (let i = 0; i < addToRecipeBody.length; i++) {
            addToRecipeBody[i].appendChild(mainRecipeInstructions);
        }

        document.getElementById("mainRecipeInstructions").appendChild(avoidError); //This is just a line of code so that the next line doesn't return an error
        while (document.getElementById("mainRecipeInstructions").lastElementChild) {
            document.getElementById("mainRecipeInstructions").removeChild(document.getElementById("mainRecipeInstructions").lastElementChild);
        }
        for (let instruction = 0; instruction < displayRecipe.instructions.length; instruction++) {
            createInstructions(displayRecipe.instructions[instruction], instruction);
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

function createInstructions(instruction, index) {
    let instructionDiv = document.createElement("div");
    let instructionStep = document.createElement("h2");
    let instructionText = document.createElement("p");

    instructionDiv.className = "recipeInstructions"
    instructionDiv.className = "recipeInstructions";
    instructionStep.className = "instructionStep";

    index++;
    instructionStep.innerText = "Step " + index;
    instructionDiv.appendChild(instructionStep);

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
    }


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
    document.getElementById("wholePage").classList.add("sidebar-open");
    document.getElementById("openBookmarkBar").style.display = "none";
}

function closeBookmark() {
    document.getElementById("wholePage").classList.remove("sidebar-open");
    document.getElementById("openBookmarkBar").style.display = "flex";
}

const SETTINGS_PANELS = ['userPrefs', 'kitchenPrefs', 'themePrefs'];

function showPanel(id) {
    SETTINGS_PANELS.forEach(pid => {
        const el = document.getElementById(pid);
        if (!el) return;
        el.style.display = (pid === id) ? 'inline-block' : 'none';
    });
}

function switchUserPrefs() { showPanel('userPrefs'); }
function switchKitchenPrefs() { showPanel('kitchenPrefs'); }
function switchThemePrefs() { showPanel('themePrefs'); }

function openSettings() {
    const settings = document.getElementById("settings");
    settings.style.display = "flex";
    showPanel('userPrefs');
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
    let newAllergenBox = document.createElement("input");
    let newAllergenLabel = document.createElement("label");

    allergenItemDiv.className = "allergenItem";
    newAllergenBox.type = "checkbox";
    newAllergenBox.value = item;

    newAllergenLabel.textContent = item;

    document.getElementById("allergenItems").appendChild(allergenItemDiv);
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

function loadKitchenPrefs() {
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

function setKitchenPrefs() {
    let buttonsInDiv = document.getElementById("kitchenPrefs").querySelectorAll("input");
    let restrictionsList = [];

    buttonsInDiv.forEach(element => {
        if (element.checked) {
            restrictionsList.push(element.value);
        }
    });

    kitchenPrefsDict["restrictions"] = restrictionsList.join(", ");
}

function applyTheme(theme) {
    const root = document.documentElement;
    root.classList.remove('theme-green', 'theme-dark-blue', 'theme-black', 'theme-white');
    root.classList.add(
        theme === 'blue' ? 'theme-dark-blue' :
            theme === 'black' ? 'theme-black' :
                theme === 'white' ? 'theme-white' :
                    'theme-green'
    );
}

function setTheme() {
    const sel = document.querySelector('input[name="theme"]:checked');
    const theme = sel ? sel.value : 'green';
    settingsDict["theme"] = theme;
    applyTheme(theme);
    try { pywebview.api.save_settings(settingsDict); } catch (e) { /* no-op */ }
}

function loadTheme() {
    const saved = (settingsDict && settingsDict["theme"]) ? settingsDict["theme"] : 'green';
    const radio = document.querySelector(`input[name="theme"][value="${saved}"]`);
    if (radio) radio.checked = true;
    applyTheme(saved);
}



//Event Listeners------------------------------------------

let restrictionsInput = document.getElementById("otherRestriction");
let allergensInput = document.getElementById("otherAllergen");
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
    document.querySelectorAll('input[name="theme"]').forEach(el => {
        el.addEventListener('change', setTheme);
    });
    loadTheme();


    loadAllergens();
    loadRestrictions();
    loadKitchenPrefs();

    for (const key in recipeDict) {
        newBookmark(recipeDict[key]);
    }
});
