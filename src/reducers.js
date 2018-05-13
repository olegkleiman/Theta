import _ from 'lodash';

const INITIAL_STATE = {
  userName: '',
  userPictureUrl: '',
  pageName: ''
};


const reducers = (state = INITIAL_STATE, action) => {

  switch( action.type ) {

    case 'LOGIN': {

        state = _.assign({}, state, {
                                      userName: action.data.userName,
                                      userPictureUrl: action.data.userPictureUrl,
                                    });

    }
    break;

    case 'LOGOUT': {

      state = _.assign({}, state, {
                                    userName: '',
                                    userPictureUrl: ''
                                  });
    }
    break;

    case 'PAGE_NAVIGATED': {
      state = _.assign({}, state, {
                                    pageName: action.data.pageName
                                  });
    }
    break;
  }

  return state;

};

export default reducers;
