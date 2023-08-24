import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Ingredient } from 'src/app/shared/ingredient.model';
import { ShoppingListService } from 'src/app/shopping-list/shopping-list.service';
import { RecipeService } from '../recipe.service';

@Component({
  selector: 'app-recipes-detail',
  templateUrl: './recipes-detail.component.html',
  styleUrls: ['./recipes-detail.component.css'],
})
export class RecipesDetailComponent implements OnInit {
  recipeInformation;
  id: number;
  constructor(private shoppingListService: ShoppingListService,
    private router: Router,
    private route: ActivatedRoute,
    private recipeService: RecipeService
  ) { }


  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.id = +params['id'];
      console.log(this.id);
      this.recipeInformation = this.recipeService.getRecipe(+this.id)
    })
  }

  sendToShoppingList() {
    // be cautious to avoid use a loop b/c of the number of events that
    // will be fired
    this.recipeInformation.ingredients.map((d: Ingredient) => {
      this.shoppingListService.addShoppingItem(d.name, d.amount);
    })
  }

  editRecipePage() {
    this.router.navigate(['edit'], {relativeTo: this.route})
  }

  deleteRecipe() {
    this.recipeService.deleteRecipe(this.id);
    this.router.navigate(['recipes'])
  }
}
