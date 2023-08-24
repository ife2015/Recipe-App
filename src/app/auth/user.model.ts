// The purpose of creating new users
export class User {
  constructor(
    public email: string,
    public id: string,
    private _token: string,
    private _tokenExpirationDate: Date
  ) {}

  // Why the Underscore andd private?
  // Private b/c the token should not be retrievable
  // when the user or you as a developer want to get access to the token,
  // you should actually be required to do that in a way that will automatically
  // check the validity and this can be achieved by adding a getter

  // validates token
  get token() {
    // checkk if token expiration date does no exist
    // if date is smaller than the current timestamp which means in the past
    if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate) {
      // then token is invalid
      return null;
    }
    return this._token;
  }
}
