import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap, take, exhaustMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Recipe } from '../recipes/recipe.model';
import { RecipeService } from '../recipes/recipe.service';

@Injectable({
  providedIn: 'root',
})
export class DataStorageService {
  constructor(
    private http: HttpClient,
    private recipesService: RecipeService,
    private authService: AuthService
  ) {}

  onFetch() {
    // Take is also imported from rxjs/operator and take is
    // called as a function and you simply pass a number to it and I pass one here
    // and what this tells RxJS is that I only want to take one value from that observable and thereafter,
    // it should automatically unsubscribe.

    // We're in sunscribe of an observable and here we create another obsverable.
    // We can't return an http observable from inside a subscribe
    // we have to insteaad return on the top level. To solve we can pipe these 2 observables
    // using exhaustMap

    // Instead we start of with the user observable and once thats done,
    // this will be replaced in the observable chain with the inner http observable
    // we return inside of that function we pass to exhaustMap.

    return this.http
      .get<Recipe[]>(
        'https://ng-recipe-app-21cc6-default-rtdb.firebaseio.com/recipes.json'
      )
      .pipe(
        map((recipes) => {
          return recipes.map((d) => {
            if (!d.ingredients) {
              return { ...d, ingredients: [] };
            }
            return d;
          });
        }),
        tap((recipes) => {
          this.recipesService.setRecipes(recipes);
        })
      );
  }

  storeRecipes() {
    const recipes = this.recipesService.getRecipes();
    this.http
      .put(
        'https://ng-recipe-app-21cc6-default-rtdb.firebaseio.com/recipes.json',
        recipes
      )
      .subscribe((response) => {
        console.log(response);
      });
  }
}
