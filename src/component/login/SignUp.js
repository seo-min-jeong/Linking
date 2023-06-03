import React, { useEffect } from 'react';
import logo from "../../icon/mainLogo.png"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api"

import './SignUp.css';

function SignUp() {
    const [userId, setUserId] = useState(null)
    const [email, setEmail] = useState(null)
    const [password, setPassword] = useState(null)
    const [firstName, setFirstName] = useState(null)
    const [lastName, setLastName] = useState(null)
    const [exist, setExist] = useState(false)

    const [member, setMember] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    })
    const [verify, setVerify] = useState({
      email: -1
    });
    
    const handleSubmit = event => {
        event.preventDefault()
        api.post('/users/sign-up', member)
          .then(response => {
            console.log(response.data)

            setUserId(response.data.userId)
            setEmail(response.data.email)
            setFirstName(response.data.firstName)
            setLastName(response.data.lastName)

            navigate(process.env.PUBLIC_URL + '/')
          })
          .catch(error => {
            console.error(error);
          });
    };

    const handleChange = event => {
        setMember({
            ...member,
            [event.target.name]: event.target.value
        });

        setVerify({
          ...verify,
          [event.target.name]: event.target.value
        });

        if (event.target.name === 'email') {
            setEmail(event.target.value)
          } else if (event.target.name === 'password') {
            setPassword(event.target.value)
          } else if (event.target.name === 'firstName') {
            setFirstName(event.target.value)
          } else if (event.target.name === 'lastName') {
            setLastName(event.target.value)
          } 
    };

    const [isMessage, setIsMessage] = useState(null)
    const handleEmailSubmit = (event) => {
        event.preventDefault();
      console.log(verify)
        if(verify.email !== -1) {
          api.post('/users/verify/email', verify)
          .then((response) => {
            console.log(response.data);
            setIsMessage(response.data.message)

          })
          .catch((error) => {
            console.log(error);
          });
        } else {
          setIsMessage('이메일을 입력해주세요.')
        }
        
      };

    const navigate = useNavigate();
 
    const onClickLogin = () => {
        navigate(process.env.PUBLIC_URL + '/')
    }

    return (
        <div className='signUp-totalBox' style={{ minWidth: '660px', minHeight: '700px' }}>

        <div>
            <img className="logo" src={ logo }/>
            <br/>
            <span className='signUp'>SignUp</span>
            {isMessage != null ? 
                    <div className='sign-message-box'>
                      <span className='sign-up-message'>* {isMessage}</span>
                    </div>
                    : 
                    <></>
                    }
            <div className='signUpBox'>
                <div className='signUpBox1'>
                    <div className='signUp-smallBox'>
                        <span className='signUpTxt'>Email</span>
                    </div>
                    <div className='signUp-smallBox'>
                        <span className='signUpTxt'>Password</span>
                    </div>
                    <div className='signUp-smallBox'>
                        <span className='signUpTxt'>FirstName</span>
                    </div>
                    <div className='signUp-smallBox'>
                        <span className='signUpTxt'>LastName</span>
                    </div>
                </div>
                <form className='signInputBox' onSubmit={ handleSubmit }>
                    <div>
                      <input 
                      className='signInput' 
                      type='text' 
                      name='email' 
                      value={email} 
                      placeholder="Enter Email" 
                      onChange={handleChange}
                      maxLength={60}
                      />
                    </div>
                    <div>
                      <input 
                      className='signInput' 
                      type='password' 
                      name='password' 
                      value={password} 
                      placeholder="Enter Password" 
                      onChange={handleChange}
                      maxLength={20}
                      />
                    </div>
                    <div>
                      <input 
                      className='signInput' 
                      type='text' 
                      name='firstName' 
                      value={firstName} 
                      placeholder="Enter FirstName" 
                      onChange={handleChange}
                      maxLength={20}
                      />
                    </div>
                    <div>
                      <input 
                      className='signInput' 
                      type='text' 
                      name='lastName' 
                      value={lastName} 
                      placeholder="Enter LastName" 
                      onChange={handleChange}
                      maxLength={20}
                      />
                    </div>
                    <div className='signBtn-box'>
                        <button className='signBtn' type='submit'>회원가입</button>
                    </div>
                </form>
                <div className='duplicate-box'>
                    <button className='duplicate-txt' onClick={ handleEmailSubmit }>중복 확인</button>
                    {/* {isMessage != null ? <span className='sign-up-message'>{isMessage}</span> : <></>} */}
                </div>
            </div>
            <div className='existBox'>
                <div className='existTxt'><span>이미 Linking 계정이 있으신가요?</span></div>
                <button className='sign-loginBtn' type='button' onClick={ onClickLogin }>Login</button>
            </div>

        </div>
        </div>
    );
}

export default SignUp;