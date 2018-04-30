import _ from 'lodash';

const INITIAL_STATE = {
  userName: '',
  userPictureUrl: '',
  accessToken: '',
  jwt: '',
  tokenType: ''
};


const reducers = (state = INITIAL_STATE, action) => {

  switch( action.type ) {

    case 'LOGIN': {

        state = _.assign({}, state, {
                                      userName: action.data.userName,
                                      userPictureUrl: action.data.userPictureUrl,
                                      accessToken: action.data.accessToken,
                                      jwt: action.data.jwt,
                                      tokenType: action.data.tokenType
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
