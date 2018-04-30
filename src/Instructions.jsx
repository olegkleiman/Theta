import React from 'react';

const Instructions = ({userName}) => (

  <div className='instructions'>
    <p>שלום, {userName}.</p>
    <p>תשתמש בתפריט למעלה לביצוע משימותיך.</p>
  </div>

);

export default Instructions;
