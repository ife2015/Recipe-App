import { EventEmitter } from "@angular/core";
import { Subject } from "rxjs";
import { Ingredient } from "../shared/ingredient.model";
import { Recipe } from "./recipe.model";

export class RecipeService {
  recipeChanged = new Subject<Recipe[]>();
  recipeSelected = new Subject<Recipe>();
 // private recipes: Recipe[] = [];
  // add private to prevent access to array from outside file
  private recipes: Recipe[] = [
    new Recipe(
      'A tes recipes',
      'Honey Garlicc BBQ',
      'https://www.eatwell101.com/wp-content/uploads/2021/07/Healthy-Chicken-with-Vegetable-Skillet-1.jpg',
      [new Ingredient('Meat', 1), new Ingredient('Fries', 20)]
    ),

    new Recipe(
      'A tes recipes',
      'Fries Poutine',
      'https://www.eatwell101.com/wp-content/uploads/2021/07/Healthy-Chicken-with-Vegetable-Skillet-1.jpg',
      [new Ingredient('Meat', 1), new Ingredient('Buns', 20)]
    ),
  ];

  getRecipes() {
    return this.recipes.slice();
  }

  getRecipe(id: number) {
    return this.recipes[id];
  }

  addRecipe(recipe: Recipe) {
    this.recipes.push(recipe);
    this.recipeChanged.next(this.recipes.slice());
  }

  updateRecipe(index: number, newRecipe: Recipe) {
    this.recipes[index] = newRecipe;
    this.recipeChanged.next(this.recipes.slice());
  }

  deleteRecipe(index: number) {
    this.recipes.splice(index, 1);
    this.recipeChanged.next(this.recipes.slice());
  }

  setRecipes(recipes: Recipe[]) {
    this.recipes = recipes;
    this.recipeChanged.next(this.recipes.slice());
  }
}
