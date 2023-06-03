import logo from "./icon/chain.png"

import './App.css';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function MainPage() {

  let post = 'L I N K I N G';
  let [제목, b] = useState('L I N K I N G');
  let leftLogo = '<';
  let rightLogo = '>';


  const navigate = useNavigate();

  const onClickLogin = () => {
    navigate('/login');
  };

  const onClickSignUp = () => {
    navigate('/signUp');
  }


  return (
    <div className="App">
        <div>
            <div className="mainlogo">
              <div className="arrowLogo"></div>
              <img className="chain" src={ logo }/>
              <div className="arrowLogo"></div>
            </div>
            <br/>
            <span className='mainLogin' onClick={ onClickLogin }>LogIn</span>
            <span className='line'>|</span>
            <span className='mainSign' onClick={ onClickSignUp }>SignUp</span>
          </div>
        
      </div>
  );
}

export default MainPage;
