import React from 'react';
import logo from "../../icon/mainLogo.png"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from '../../utils/api'
import CreateProjectModal from '../CreateProjectModal'

import './Login.css'

// const firebaseConfig = {
//   apiKey: "AIzaSyBMMTjliC7P4S0SDDr-o-ybMA1y2KxUK4c",
//   authDomain: "linking-32bc1.firebaseapp.com",
//   projectId: "linking-32bc1",
//   storageBucket: "linking-32bc1.appspot.com",
//   messagingSenderId: "907357123753",
//   appId: "1:907357123753:web:a844de16276ef2a15965b8",
//   measurementId: "G-BJV39NP01T"
// }

function Login(props) {
    //알림 토큰
    // const [token, setToken] = useState('')

    // function requestPermission() {
    //     Notification.requestPermission().then((permission) => {
    //         if (permission === 'granted') {
    //             const app = initializeApp(firebaseConfig);
    //             const messaging = getMessaging(app);
    //             getToken(messaging, { vapidKey: 'BPeyW-3BerAbyuW7AD8OkSDmDuV2zjin233LBToAnDuKxoQl1LKEk7v-RBTskTwX7Bc6IpRm-VgBxKrOZiu-WrQ' })
    //                 .then((currentToken) => {
    //                     if (currentToken) {
    //                         setToken(currentToken);
    //                         console.log(currentToken);
    //                     } else {
    //                         console.log('Cannot get token');
    //                     }
    //                 });
    //             // onMessage(messaging, (payload) => {
    //             //     console.log('Message received:', payload);
    //             //     //
    //             //     // window.location.href = 'http://localhost:3007';
    //             // });
    //         } else {
    //             console.log('Do not have permission!');
    //         }
    //     });
    // }
    // requestPermission()

  const{ setIsLoggedIn, onValueProjectList } = props

    const [email, setEmail] = useState(null)
    const [password, setPassword] = useState(null)

    const [member, setMember] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: ''
    })

    // requestPermission()

    //로그인 요청
    const [isProject, setIsProject] = useState(false);
      const handleSubmit = event => {
        event.preventDefault()

        api.post('/users/sign-in', member)
          .then(response => {
            localStorage.setItem('user', JSON.stringify(response.data.data))
            // setIsLoggedIn(true)
            // requestPermission()

            api.get('/projects/list/part/' + response.data.data.userId, { validateStatus: false })
            .then(respon => {
                if (respon.status === 404) {
                    navigate(process.env.PUBLIC_URL + '/linking')
                    // setIsLoggedIn(true)
                  } else {
                    onValueProjectList(respon.data.data)
                    navigate(process.env.PUBLIC_URL + '/home')
                    setIsLoggedIn(true)
                  }
                
                //알림토큰 보내기
                // const userToken = {
                //     userId: response.data.data.userId,
                //     token: token
                // }
                // console.log(userToken)
                // api.put('/fcm-token/web', userToken)
                // .then(response => {
                //     console.log('알림 토큰 전송 완료 : ', response.data)
                // })

            })
            .catch(error => {
                setIsLoggedIn(false)
                console.error(error)
            })

            .catch(error => {
                console.error(error);
            })

          })
          .catch(error => {
            setIsLoggedIn(false)
            console.error(error);
          })
    };

    const handleChange = event => {
        setMember({
            ...member,
            [event.target.name]: event.target.value
        })

        if (event.target.name === 'email') {
            setEmail(event.target.value)
          } else if (event.target.name === 'password') {
            setPassword(event.target.value)
          } 
    }

    const navigate = useNavigate();
    const onClickSignUp = () => {
        navigate(process.env.PUBLIC_URL + '/signUp')
    }

      const onClickButton = () => {
        setIsProject(isProject => !isProject);
    }

    return (
        <div className='login-total-box' style={{ minWidth: '660px', minHeight: '670px' }}>
            <div>
                <div className='logoBox'>
                    <img className="logo2" src={ logo }/>
                    <br/>
                    <span className='login2'>LogIn</span>
                </div>
                <div className='loginBox'>
                    <div className='idAndPw'>
                        <div className='login_id'>
                            <span className='input_id'>Email</span>
                            <input 
                            className='loginInput' 
                            type='text' 
                            name='email' 
                            value={email} 
                            onChange={handleChange} 
                            maxLength={60}
                            />
                        </div>
                        <div className='login_pw'>
                            <span className='input_pw'>Password</span>
                            <input 
                            className='loginInput' 
                            type='password' 
                            name='password' 
                            value={password} 
                            onChange={handleChange} 
                            maxLength={20}
                            />
                        </div>
                    </div>
                    <div className='loginBtn-box'>
                        <button className='loginBtn' type='button' onClick={ handleSubmit }>로그인</button>
                    </div>
                </div>
                <div className='apple-login-box'>
                <meta name="appleid-signin-client-id" content="[CLIENT_ID]" />
                <meta name="appleid-signin-scope" content="[SCOPES]" />
                <meta name="appleid-signin-redirect-uri" content="[REDIRECT_URI]" />
                <meta name="appleid-signin-state" content="[STATE]" />

                <style>{`
                    .signin-button {
                    width: 355px;
                    height: 40px;
                    }
                `}</style>

                <div
                    id="appleid-signin"
                    className="signin-button"
                    data-color="white"
                    data-border="true"
                    data-type="sign-in"
                />
                </div>
                <div className='loginOrBox'><span className='loginOrTxt'>- OR -</span></div>
                <div className='user-signBtn-box'>
                    <button className='user-signBtn' type='button' onClick={ onClickSignUp }>일반 회원 회원가입</button>
                </div>
            </div>
            {isProject ? <CreateProjectModal isOpen={isProject} setIsOpen={setIsProject} onClose={onClickButton} /> : <></> }
        </div>
    )
}

export default Login