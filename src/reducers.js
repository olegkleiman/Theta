import _ from 'lodash';

const INITIAL_STATE = {
  userName: '',
  userPictureUrl: ''
};


const reducers = (state = INITIAL_STATE, action) => {

  switch( action.type ) {

    case 'LOGIN': {

        state = _.assign({}, state, {
                                      userName: action.data.userName,
                                      userPictureUrl: action.data.userPictureUrl
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
  }

  return state;

};

export default reducers;
