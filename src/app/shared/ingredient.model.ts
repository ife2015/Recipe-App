export class Ingredient {
  // adding public within the constructor parameters is
  // a short cut for adding properities to the class
  // it automatically creates them
  constructor(public name: string, public amount: number) {}
}
