import React, { useState, useRef, useEffect } from "react";
import api from '../../utils/api'
import './Header.css';
import { useCookies } from 'react-cookie'

import noti from "../../icon/ring2.png"
import redNoti from "../../icon/redNoti.png"
import greenNoti from "../../icon/greemNoti.png"

function Noti() {
    const user = JSON.parse(localStorage.getItem('user'))
    const [cookies] = useCookies(['session'])
    const notiMenuRef = useRef(null);
    const [isNoti, setNoti] = useState(false);
    const [notiList, setNotiList] = useState([])
    const [badge, setBadge] = useState(0)
    const [isChecking, setIsChecking] = useState(false)

    //알림 WebSocket 
    const socket = useRef(null)
    useEffect(() => {
      socket.current = new WebSocket('ws://43.201.231.51:8080/ws/push-notifications?userId=' + user.userId);
      
      socket.current.onopen = () => {
        console.log('알림 웹소켓 연결성공');
      };

      socket.current.onmessage = ('badge', (event) => {
          const receivedMessage = JSON.parse(event.data);
          console.log(event.data)
          setBadge(receivedMessage.data)
          console.log('Received message:', receivedMessage);
      })
    
      return () => {
        socket.current.close();
        console.log('닫힘')
      };
    }, []);

    const notiToggleMenu = () => {
      //알림창 오픈할때
      if(isNoti === false) {
        const openMessage = {
          isChecking: true
        }
        socket.current.send(JSON.stringify(openMessage));
        console.log('isChecking===true 보내기 성공')

        api.get('/push-notifications/' + user.userId)
        .then(response => {
          console.log('알림함 조회 : ', response.data.data)
          setNotiList(response.data.data)
        })
        .catch(error => {
            console.error(error)
        })
        setNoti(isNoti => !isNoti)
        setIsChecking(true)
        setBadge(0)
      } else {
        //알림창 닫을때
        const openMessage = {
          isChecking: false
        }
        socket.current.send(JSON.stringify(openMessage));
        console.log('isChecking===false 보내기 성공')

        setNoti(isNoti => !isNoti)
        setIsChecking(false)
      }
    }

    useEffect(() => {
        const handleOutsideClose = (e) => {
          if (isNoti && (!notiMenuRef.current || !notiMenuRef.current.contains(e.target))) {
            setNoti((isNoti) => !isNoti);
          }
        };
      
        document.addEventListener('click', handleOutsideClose);
      
        return () => {
          document.removeEventListener('click', handleOutsideClose);
        };
      }, [isNoti]);

      if(isNoti === true) {
        socket.current.onmessage = ('push', (event) => {
          const receivedMessage = JSON.parse(event.data)
          console.log('Received message:', receivedMessage)
          setNotiList(prevNotiArr => [...prevNotiArr, receivedMessage.data])
        })
      }
      

    return(
        <div className="noti-menu" ref={ notiMenuRef }>
          <div className="chat-img-box">
            <img className="chat-header-bar" src = { noti } onClick={ notiToggleMenu } />
            {badge !== 0 ?
            <div className="badge-box">
              <span className="badge-txt">{badge}</span>
            </div>
            :
            <div className="no-badge-box">
              <span className="badge-txt"></span>
            </div>
            }
          </div>
            <div className={isNoti ? "notiShow-menu" : "notiHide-menu"}>
                        <div className="notiMenu-bar">
                            <div className="noti-list-box">
                                <span className="noti-list">알림함</span>
                            </div>
                            <div className="noti-body-box">
                              {notiList.map((noti, index) => (
                                  <div className="noti-box">
                                      <div className="noti-tag-box">
                                          {noti.priority === 0 ? <img src={redNoti} className={noti.checked ? "noti-check-img" : "noti-img"}/> : <></>}
                                          {noti.priority === 1 ? <img src={greenNoti} className={noti.checked ? "noti-check-img" : "noti-img"}/> : <></>}
                                          {/* <div className={noti.checked ? "tag-check" : "tag-line"} /> */}
                                          <li className={noti.checked ? "noti-check" : ""} >{noti.body}</li>
                                      </div>
                                      <div className="noti-span-box">
                                          <span className={noti.checked ? "noti-check" : ""}>{noti.info}</span>
                                      </div>
                                  </div>
                              ))}
                            </div>
            </div>
          </div>

        </div>
    );
}

export default Noti;