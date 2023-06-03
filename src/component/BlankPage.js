import React, { useState, useRef, useEffect } from "react";
import './BlankPage.css';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import { EventSourcePolyfill } from 'event-source-polyfill'
import { useCookies } from 'react-cookie'

import PageNoti from "./PageNoti"
import PageDeleteModal from "./PageDeleteModal";
import PageNoPopup from "./PageNoPopup"
import trash from "../icon/trash.png"

function BlankPage() {
    const location = useLocation();
    const [data, setData] = useState(location.state);
    const user = JSON.parse(localStorage.getItem('user'));
    const [notiArray, setNotiArray] = useState(data.doc.pageCheckResList)

    const[isNoPage, setIsNoPage] = useState()
    const [pageTitle, setPageTitle] = useState(data.doc.title)
    const [id, setId] = useState(data.doc.pageId)
    const [projectId, setProjectId] = useState(data.projectId)
    const [pageCheckResList, setPageCheckResList] = useState(data.doc.pageCheckResList)
    const [test, setTest] = useState(data.doc.content)


    useEffect(() => {
        setData(location.state)
        setPageTitle(location.state.doc.title)
        setId(location.state.doc.pageId)
        setProjectId(location.state.projectId)
        setPageCheckResList(location.state.doc.pageCheckResList)
        setTest(location.state.doc.content)
    }, [location.state])

    const EventSource = EventSourcePolyfill
    const [pageEventSource, setPageEventSource] = useState(null);
    useEffect(() => {
        const newEventSource = new EventSource('http://43.201.231.51:8080/pages/subscribe/' + data.doc.pageId,
            { 
              headers: { 
                'userId': user.userId,
                'Cache-Control': 'no-cache',
                'Last-Event-ID': '',
                'Content-Type': 'text/event-stream',
                'X-Accel-Buffering': 'no'
               },
              retry: 600000,
              timeout: 600000
            }
          )

        newEventSource.onopen = () => {
            console.log(data.doc.pageId +'Page Connected to server!')
        }
      
        newEventSource.addEventListener('connect', (event) => {
            const { data: receivedConnectData } = event;
            console.log('page connect event data: ', receivedConnectData);
        });
      
        //페이지 수정
        newEventSource.addEventListener('putPageTitle', (event) => {
            const newData = JSON.parse(event.data)
            const {title, pageId } = newData
            if(id === pageId) {
                setPageTitle(title)
            }
        })

        //페이지 삭제
        newEventSource.addEventListener('deletePage', (event) => {
            const newData = JSON.parse(event.data)
            setIsNoPage(newData)
        })
        //noti-enter
        newEventSource.addEventListener('enter', (event) => {
            const newData = JSON.parse(event.data)
            const { userId, isChecked, lastChecked } = newData

            setNotiArray(data => {
                return data.map(item => {
                    if (item.userId === userId) {
                        return {
                            ...item,
                            isChecked: isChecked,
                            lastChecked: lastChecked,
                            isEntering: true
                        }
                    }
                    return item
                })
            })
        })
        //noti-leave
        newEventSource.addEventListener('leave', (event) => {
            const newData = JSON.parse(event.data)
            const { userId, isChecked, lastChecked } = newData

            setNotiArray(data => {
                return data.map(item => {
                    if (item.userId === userId) {
                        return {
                            ...item,
                            isChecked: isChecked,
                            lastChecked: lastChecked,
                            isEntering: false
                        }
                    }
                    return item
                })
            })
        })

        setPageEventSource(newEventSource)
        
        return() => {
            newEventSource.close();
            console.log('page close!!!!!!!!!!!!!!!!!!!!')
        }
    }, [data.doc.pageId]);

    const lookMenuRef = useRef(null);
    const [isLook, setIsLook] = useState(false)

    useEffect(() => {
        const handleOutsideClose = (e) => {
          if(isLook && (!lookMenuRef.current || !lookMenuRef.current.contains(e.target))) setIsLook(isLook => !isLook);
        };
        document.addEventListener('click', handleOutsideClose);
        
        return () => document.removeEventListener('click', handleOutsideClose);
    }, [isLook]);

    const [dataArray, setDataArray] = useState(data.doc.blockResList);
    const [isDot, setIsDot] = useState([])

    useEffect(() => {
    setIsDot(new Array(data.length).fill(false));
    }, [dataArray])
 
    //페이지 삭제
    const [isDeletePage, setIsDeletePage] = useState(false)
    const handleDeletePage = () => { 
        setIsDeletePage(isDeletePage => !isDeletePage)
    }

    /* ************************************************************* */
    //실시간 동시편집
    const socketRef = useRef(null)
    const textRef = useRef(null)
    const cursorPosRef = useRef(null)

    //WebSocket 연결
    useEffect(() => {
        socketRef.current = new WebSocket('ws://43.201.231.51:8080/ws/pages?projectId='+ projectId + '&pageId=' + id + '&userId=' + user.userId)
    
        socketRef.current.onopen = () => {
            console.log('빈페이지 웹소켓 연결성공')
        }

        socketRef.current.addEventListener('open', () => {
            console.log('빈페이지 웹소켓 연결성공!!!')
          })
      
        return () => {
            if (socketRef.current !== null) {
                socketRef.current.close()
                console.log('빈페이지 웹소켓 닫힘')
            }
        }
    }, [])

    useEffect(() => {
        adjustTextareaHeight();
      }, [test]);

    const handleChange = (event) => {
        console.log(event.target.value)
        
        setTest(event.target.value)
        cursorPosRef.current = event.target.selectionStart
        const updateContent = {
            editorType: 0,
            docs: event.target.value
        }
        const sendData = JSON.stringify(updateContent);
        console.log('변경된거 소켓에 보냄: ', sendData);

        if (socketRef.current !== null && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(sendData);
        }

        adjustTextareaHeight();
    }
    useEffect(() => {
        socketRef.current.onmessage = (event) => {
            const receivedMessage = JSON.parse(event.data)

            //insert인 경우
            if(receivedMessage.diffStr.type === 0) {
                const updatedTest = test.slice(0, receivedMessage.diffStr.diffStartIndex) + receivedMessage.diffStr.subStr + test.slice(receivedMessage.diffStr.diffStartIndex+1)
                setTest(updatedTest, restoreCursorPosition)
                console.log('받은 메세지: ', updatedTest)
            } 

            if(receivedMessage.diffStr.type === 1) {
                const updatedTest = test.slice(0, receivedMessage.diffStr.diffStartIndex) + receivedMessage.diffStr.subStr + test.slice(receivedMessage.diffStr.diffEndIndex + 1);
                setTest(updatedTest, restoreCursorPosition)
                console.log('받은 메세지: ', updatedTest)
            }
        }
    }, [test])

    const restoreCursorPosition = () => {
        // if (textRef.current) {
        //     const { selectionStart } = textRef.current
        //     textRef.current.selectionStart = selectionStart;
        //     textRef.current.selectionEnd = selectionStart;
        //     textRef.current.focus(); 
        // }
        if (textRef.current) {
            textRef.current.focus();
            const { value } = textRef.current;
            const newPosition = cursorPosRef.current;
            textRef.current.setSelectionRange(newPosition, newPosition);
        }
      }

      const adjustTextareaHeight = () => {
        const textarea = textRef.current;
        textarea.style.height = 'auto'; // Reset height to auto
        textarea.style.height = textarea.scrollHeight + 'px'; // Set height to content height
      }
      
  
    return(
        <div style={{ minWidth: '980px', minHeight: '715px' }}>
            <div className="doc-header-box" ref={ lookMenuRef }>
                <div className="look-box">
                    <div className="look-sec-box" >
                        <PageNoti data={pageCheckResList} pageTitle={pageTitle} pageId={id} projectId={projectId}/>
                    </div>
                </div>
                
                <div className="doc-title-box">
                    <span className='doc-title-txt'>{pageTitle}</span>
                </div>
                <div className="blank-trash-box">
                    <img className="doc-trashImg" src={ trash } onClick={handleDeletePage}/>
                </div>
            </div>
            <div className="blank-content-box" id="editor">
                <textarea 
                className="blank-textarea"
                ref={textRef}
                value={test}
                onChange={handleChange}
                lang="en"
                />
            </div>
            {/* <div className="blank-trash-box">
                <img className="doc-trashImg" src={ trash } onClick={handleDeletePage}/>
            </div> */}
            {isDeletePage ? <PageDeleteModal isDeletePage={isDeletePage} setIsDeletePage={setIsDeletePage} onClose={handleDeletePage} pageId={id} /> : <></> }
            {isNoPage != null ? <PageNoPopup isNoPage={isNoPage} setIsNoPage={setIsNoPage} /> : <></> }
        </div>

    );
}

export default BlankPage;
