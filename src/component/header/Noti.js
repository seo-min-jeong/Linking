import React, { useState, useRef, useEffect } from "react"
import api from '../../utils/api'
import './Header.css'

import noti from "../../icon/ring2.png"
import redNoti from "../../icon/redNoti.png"
import greenNoti from "../../icon/greemNoti.png"
import greenCheck from "../../icon/green-check.png"
import redCheck from "../../icon/red-check.png"

function Noti() {
    const user = JSON.parse(localStorage.getItem('user'))
    const notiMenuRef = useRef(null)
    const [isNoti, setNoti] = useState(false)
    const [notiList, setNotiList] = useState([])
    const [badge, setBadge] = useState(0)
    const [isChecking, setIsChecking] = useState(false)

    //알림 WebSocket 
    const socket = useRef(null)
    useEffect(() => {
      socket.current = new WebSocket('wss://mylinking.shop/ws/push-notifications?userId=' + user.userId)
      
      socket.current.onopen = () => {
        console.log('알림 웹소켓 연결성공')
      };

      socket.current.onmessage = ('badge', (event) => {
          const receivedMessage = JSON.parse(event.data)
          setBadge(receivedMessage.data)
          console.log('Received message:', receivedMessage)
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
        socket.current.send(JSON.stringify(openMessage))

        api.get('/push-notifications/' + user.userId)
        .then(response => {
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
        socket.current.send(JSON.stringify(openMessage))

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
                                        {noti.noticeType === 'TODO' ? 
                                        <>
                                          {noti.priority === 0 ? <img src={redCheck} className={noti.checked ? "noti-check-img" : "noti-img"}/> : <></>}
                                          {noti.priority === 1 ? <img src={greenCheck} className={noti.checked ? "noti-check-img" : "noti-img"}/> : <></>}
                                        </> 
                                        : 
                                        <>
                                          {noti.priority === 0 ? <img src={redNoti} className={noti.checked ? "noti-check-img" : "noti-img"}/> : <></>}
                                          {noti.priority === 1 ? <img src={greenNoti} className={noti.checked ? "noti-check-img" : "noti-img"}/> : <></>}
                                        </>
                                        }
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
    )
}

export default Noti