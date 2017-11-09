const recoverPassword = (state = {}, action) => {
  switch (action.type) {
    case 'USER_EMAIL':
      return { ...state, email: action.email };
    default:
      return state;
  }
};
export default recoverPassword;
