import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Ingredient } from 'src/app/shared/ingredient.model';
import { ShoppingListService } from '../shopping-list.service';
@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css'],
})
export class ShoppingEditComponent implements OnInit, OnDestroy {
  @ViewChild('formSign', {static: false}) signUpForm: NgForm;
  constructor(private shoppingListService: ShoppingListService) { }
  subscription: Subscription;
  editMode = false;
  edittedItemIndex: number;
  edittedItem: Ingredient;

  ngOnInit(): void {
    this.subscription = this.shoppingListService.startedEditting.subscribe((index: number) => {
      this.editMode = true;
      this.edittedItemIndex = index;
      this.edittedItem = this.shoppingListService.getIngredient(index);
      this.signUpForm.setValue({
        'name': this.edittedItem.name,
        'amount': this.edittedItem.amount
      })
    })
  }
  onAddItem() {
    const newIngredient = new Ingredient(this.signUpForm.value.name, +this.signUpForm.value.amount);

    if (this.editMode) {
      this.shoppingListService.updateIngredient(this.edittedItemIndex, newIngredient);
    } else {
      this.shoppingListService.addShoppingItem(this.signUpForm.value.name, +this.signUpForm.value.amount);
    }

    this.clearForm();
  }

  clearForm() {
    this.editMode = false;
    this.signUpForm.reset();
  }

  deleteForm() {
    this.shoppingListService.deleteIngredient(this.edittedItemIndex);
    this.clearForm();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
