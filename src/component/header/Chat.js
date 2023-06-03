import React, { useState, useRef, useEffect, useSyncExternalStore } from "react";
import chat from "../../icon/chatImg.png"
import api from '../../utils/api';
import { useCookies } from 'react-cookie';

import './Header.css';
import './Chat.css';
import airplane from "../../icon/airplane.png"
import chatUser from "../../icon/chat-user.png"

function Chat(props) {
    const { projectId, isRegister, setIsRegister } = props
    const [isChat, setChat] = useState(false)
    const [page, setPage] = useState(0)
    const [cookies] = useCookies(['session'])
    const [badge, setBadge] = useState(0)

    //WebSocket 연결
    const socket = useRef(null)
    const user = JSON.parse(localStorage.getItem('user'))

    useEffect(() => {
        socket.current = new WebSocket('ws://43.201.231.51:8080/ws/chatting');
        
        socket.current.onopen = () => {
          const registrationMessage = {
            userId: user.userId,
            projectId: projectId,
            content: '',
            sentDatetime: '',
            reqType: 'register',
            isFocusing: false
          };

          socket.current.send(JSON.stringify(registrationMessage))
          console.log('세션 등록');
        };

        socket.current.onmessage = ('register', (event) => {
            const receivedMessage = JSON.parse(event.data);
            console.log('Received message:', receivedMessage);
        })

        //
        socket.current.onmessage = ('badgeAlarm', (event) => {
          const receivedMessage = JSON.parse(event.data);
          setBadge(receivedMessage.data)
          console.log('Received badgeAlarm:', receivedMessage)
      })
        return () => {
          socket.current.close()
          console.log('채팅 웹소켓 닫힘')
        };
      }, [projectId])

      const [msgList, setMsgList] = useState([])
      const [userList, setUserList] = useState([])

      //채팅방 열기
      const openChatRoom = () => {
        setPage(prevPage => prevPage + 1);
        setChat(true);
        setBadge(0)
        const openMessage = {
            userId: user.userId,
            projectId: projectId,
            content: '',
            sentDatetime: '',
            reqType: 'open',
            isFocusing: true
        };
        socket.current.send(JSON.stringify(openMessage));
        console.log('채팅방 열기 성공')

        socket.current.onmessage = ('userList', (event) => {
            const receivedMessage = JSON.parse(event.data)
            console.log('Received message:', receivedMessage);
            setUserList(receivedMessage.data)
        })

        api.get('/chatroom/' + projectId + '/chat-list?size=10&page=' + page)
            .then(response => {
                const reversedChatList = response.data.data.reverse();
                setMsgList(reversedChatList)
            })
            .catch(error => {
                console.error(error)
            })
      }

      //메세지 전송
      const [inputText, setInputText] = useState("")
      const handleInputChange = (event) => {
        setInputText(event.target.value);
      }

      const sendConversationMessage = () => {
        const now = new Date()
        const time = now.toLocaleString()

        const conversationMessage = {
            userId: user.userId,
            projectId: projectId,
            content: inputText,
            sentDatetime: time,
            reqType: 'text',
            isFocusing: true
        };
        socket.current.send(JSON.stringify(conversationMessage))
        console.log('채팅 전송 성공')

        setInputText("")

        socket.current.onmessage = ('textMessage', (event) => {
            const receivedMessage = JSON.parse(event.data);
            setMsgList(prevMsgList => [...prevMsgList, receivedMessage.data]);
        })
      }

      //채팅방 닫기
      const closeChatRoom = () => {
        setPage(prevPage => 0);
        setIsOpenUser(false)
        setChat(false);
        const closeMessage = {
            userId: user.userId,
            projectId: projectId,
            content: '',
            sentDatetime: '',
            reqType: 'close',
            isFocusing: false
        };
        socket.current.send(JSON.stringify(closeMessage));
        console.log('채팅방 닫기')

        socket.current.onmessage = ('close', (event) => {
          const receivedMessage = JSON.parse(event.data)
          console.log('Received message:', receivedMessage)
          if (receivedMessage.resType === 'userList') {
            setUserList(receivedMessage.data)
          } else if(receivedMessage.resType === 'badgeAlarm') {
            setBadge(receivedMessage.data)
          }
        })
      }
      
      //연결 끊기
      const disconnectSession = () => {
        const disconnectMessage = {
          reqType: 'disconnect',
        };
        socket.current.send(JSON.stringify(disconnectMessage));
        socket.current.close();
      };

      //채팅방 인원 확인
      const [isOpenUser, setIsOpenUser] = useState(false)
      const onClickUser = () => {
        setIsOpenUser(isOpenUser => !isOpenUser)
      }

      //채팅 맨 밑부터 보여주기
      const chatBodyRef = useRef(null)
      const [totalChatHeight, setTotalChatHeight] = useState(0);

      useEffect(() => {
        if(msgList.length > 10) {
          scrollToBottom()
        }
      }, [msgList])
      
      const scrollToBottom = () => {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight - totalChatHeight
      }

      useEffect(() => {
        api
          .get('/chatroom/' + projectId + '/chat-list?size=10&page=' + page)
          .then((response) => {
            const newMessages = response.data.data.reverse();
            setMsgList((prevMsgList) => [...newMessages, ...prevMsgList]);
            setIsLoadingMore(false);
          })
          .catch((error) => {
            console.error(error);
            setIsLoadingMore(false);
          });
      }, [page])

      if(isRegister === false) {
        const now = new Date()
        const time = now.toLocaleString()
        const registrationMessage = {
          userId: user.userId,
          projectId: projectId,
          content: '',
          sentDatetime: time,
          reqType: 'unregister',
          isFocusing: false
        };

        socket.current.send(JSON.stringify(registrationMessage))
        console.log('프로젝트 변경')
        setIsRegister(true)
      }

      //데이터 페이징 요청
      const [isLoadingMore, setIsLoadingMore] = useState(false)

      // const handleScroll = (event) => {
      //   const { scrollTop } = event.target;
      //   if (scrollTop === 0) {
      //     setTotalChatHeight(event.target.scrollHeight)
      //     loadMoreMessages();
      //   } else {
      //     setTotalChatHeight(event.target.scrollTop)
      //   }
      // }      
    
      const loadMoreMessages = () => {
        setIsLoadingMore(true);
          setPage((prevPage) => prevPage + 1)
      }

      const chatBodyElement = chatBodyRef.current;
      useEffect(() => {
        if (chatBodyElement) {
          chatBodyElement.scrollTop = chatBodyElement.scrollHeight;
        }
      }, [chatBodyElement])

      useEffect(() => {
        const handleScroll = (event) => {
          const { scrollTop } = event.target;
          if (scrollTop === 0) {
            setTotalChatHeight(event.target.scrollHeight);
            loadMoreMessages();
          } else {
            setTotalChatHeight(event.target.scrollTop);
          }
        };
      
        if (chatBodyElement) {
          chatBodyElement.addEventListener('scroll', handleScroll);
        }
      
        return () => {
          if (chatBodyElement) {
            chatBodyElement.removeEventListener('scroll', handleScroll);
          }
        };
      }, [chatBodyElement]);

      useEffect(() => {
        setBadge(badge)
      }, [badge]);

      // useEffect(() => {
      //   window.addEventListener('beforeunload', disconnectSession)
      //   return () => {
      //     window.removeEventListener('beforeunload', disconnectSession);
      //   };
      // }, []);

    return(
        <div className="chat-menu">
          <div className="chat-img-box">
            {isChat ? 
            <img className="open-header-bar" src = { chat } onClick={ closeChatRoom } /> 
            :
            <img className="chat-header-bar" src = { chat } onClick={ openChatRoom } />
            }
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
            <div className={isChat ? "chatShow-menu" : "chatHide-menu"}>
                <div className="chatMenu-bar">
                  <img src={chatUser} className="chat-user-img" onClick={onClickUser}/>
                  <span className="chat-length-txt">{userList.length}</span>
                  <span className="chat-menu-txt">CHAT</span>
                </div>

                <div className="chat-body" ref={chatBodyRef}>
                {isLoadingMore && <div className="chat-load-box">Loading more messages...</div>}
                  {msgList.map((msg, index) => (
                    <div className="chat-sec-box" key={index}>
                      <div className="chat-profile-box">
                        <span className="chat-profile-txt">{msg.firstName}</span>
                      </div>
                      <div className="chat-name-box">
                        <span className="chat-name-txt">{msg.userName}</span>  
                      </div>
                      <div className="chat-content-box">
                        <span className="chat-content-txt">{msg.content}</span>  
                      </div>
                      <div className="chat-date-box">
                        <span className="chat-date-txt">{msg.sentDatetime}</span>  
                      </div>
                    </div>
                  ))}
                </div>

                <div className="chat-input-box">
                    <input 
                        className="chat-input"
                        type="text"
                        value={inputText}
                        onChange={handleInputChange}
                        placeholder="Send message"
                    />
                    <img 
                        className="chat-input-img" 
                        src={airplane} 
                        onClick={sendConversationMessage}
                    />
                </div>
          </div>
          {isOpenUser ? 
          <div className="open-user-box">
            {/* <div className="chatlist-box">
              <span className="chatlist-txt">채팅 접속중</span>
            </div> */}
            {userList.map((user) => (
              <div className="chat-user-box">
                <img src={chatUser} className="chatlist-user-img" onClick={onClickUser}/>
                <span className="chat-user-txt">{user.userName}</span>
              </div>
            ))}
            
          </div> 
          : 
          <>
          </>
          }

        </div>
    );
}

export default Chat;