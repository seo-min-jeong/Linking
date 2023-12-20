import React, { useState, useRef, useEffect, createContext } from "react"
import './Document.css'
import { useLocation } from 'react-router-dom'
import api from '../utils/api';
import { EventSourcePolyfill } from 'event-source-polyfill'

import Content from "./Content"
import PageNoti from "./PageNoti"
import AddAnnotation from "./AddAnnotation"
import UpdateAnnotation from "./UpdateAnnotation"
import PageDeleteModal from "./PageDeleteModal"
import PageNoPopup from "./PageNoPopup"
import BlockCloneModal from "./BlockCloneModal"

import plus from "../icon/plus.png"
import arrowUp from "../icon/arrowUp.png"
import arrowBelow from "../icon/arrowBelow.png"
import dot from "../icon/dot.png"
import annotation from "../icon/updateIcon.png"
import deleteIcon from "../icon/deleteIcon.png"
import trash from "../icon/trashBlack.png"
import reproduction from "../icon/reproduction.png"
import updateAnno from "../icon/updateAnno.png"

export const EventSourceContext = createContext();

function Document() {
    const location = useLocation()
    const [data, setData] = useState(location.state);
    const user = JSON.parse(localStorage.getItem('user'))
    const[isNoPage, setIsNoPage] = useState()
    const [notiArray, setNotiArray] = useState(data.doc.pageCheckResList)
    const [pageTitle, setPageTitle] = useState(data.doc.title)
    const [dataArray, setDataArray] = useState(data.doc.blockResList)
    const [array, setArray] = useState(data.doc)
    const [id, setPageId] = useState(data.doc.pageId)
    const [projectId, setProjectId] = useState(data.projectId)
    const[title, setTitle] = useState('untitled')

    //통신
    const [blockArr, setBlockArr] = useState({
        pageId: data.doc.pageId,
        order: data.doc.length,
        title: ''
    })

    const titleRef = useRef(null)
    const contentRef = useRef(null)

    //new Data
    useEffect(() => {
        console.log('변경됨')
        setData(location.state)
        setNotiArray(location.state.doc.pageCheckResList)
        setPageTitle(location.state.doc.title)
        setDataArray(location.state.doc.blockResList)
        setArray(location.state.doc)
        setPageId(data.doc.pageId)
        setProjectId(data.projectId)
    }, [location.state])

    //실시간 동시편집
    const socketRef = useRef(null)

    useEffect(() => {
        renderBlockAndAnnotation()
    }, [dataArray])

    //WebSocket 연결
    useEffect(() => {
        socketRef.current = new WebSocket('ws://url/ws/pages?projectId='+ projectId + '&pageId=' + id + '&userId=' + user.userId)
    
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

    //소켓으로 데이터 받기
    useEffect(() => {
        socketRef.current.onmessage = (event) => {
            const receivedMessage = JSON.parse(event.data)

            //title
            if(receivedMessage.editorType === 1) {
                //insert인 경우
                if(receivedMessage.diffStr.type === 0) {
                    setDataArray(prevDataArray => {
                        const newArr = prevDataArray.map((data, dataIndex) => {
                            if(data.blockId === receivedMessage.blockId) {
                                const updatedTest = data.title.slice(0, receivedMessage.diffStr.diffStartIndex) + receivedMessage.diffStr.subStr + data.title.slice(receivedMessage.diffStr.diffStartIndex+1)
                                console.log('받은 메세지: ', updatedTest)
                                return { ...data, title: updatedTest }
                            }
                            return data
                        })
                        return newArr
                    })
                } 

                //update인 경우
                if(receivedMessage.diffStr.type === 1) {
                    setDataArray(prevDataArray => {
                        const newArr = prevDataArray.map((data, dataIndex) => {
                            if(data.blockId === receivedMessage.blockId) {
                                const updatedTest = data.title.slice(0, receivedMessage.diffStr.diffStartIndex) + receivedMessage.diffStr.subStr + data.title.slice(receivedMessage.diffStr.diffEndIndex + 1)
                                console.log('받은 메세지: ', updatedTest)
                                return { ...data, title: updatedTest }
                            }
                            return data
                        })
                        return newArr
                    })
                }
            } 

            //content
            if(receivedMessage.editorType === 2) {
                //insert인 경우
                if(receivedMessage.diffStr.type === 0) {
                    setDataArray(prevDataArray => {
                        const newArr = prevDataArray.map((data, dataIndex) => {
                            if(data.blockId === receivedMessage.blockId) {
                                const updatedTest = data.content.slice(0, receivedMessage.diffStr.diffStartIndex) + receivedMessage.diffStr.subStr + data.content.slice(receivedMessage.diffStr.diffStartIndex+1)
                                console.log('수정데이터' , receivedMessage.diffStr.subStr)
                                console.log('받은 메세지: ', updatedTest)
                                return { ...data, content: updatedTest }
                            }
                            return data
                        })
                        return newArr
                    })
                } 

                //update인 경우
                if(receivedMessage.diffStr.type === 1) {
                    setDataArray(prevDataArray => {
                        const newArr = prevDataArray.map((data, dataIndex) => {
                            if(data.blockId === receivedMessage.blockId) {
                                const updatedTest = data.content.slice(0, receivedMessage.diffStr.diffStartIndex) + receivedMessage.diffStr.subStr + data.content.slice(receivedMessage.diffStr.diffEndIndex + 1)
                                console.log('받은 메세지: ', updatedTest)
                                return { ...data, content: updatedTest }
                            }
                            return data
                        })
                        return newArr
                    })
                }
            } 
        }
    }, [dataArray])

    //소켓에 블록 제목 전송
    const handleTitleChange = (event, blockId) => {
        const newTitle = event.target.value

        setDataArray(prevDataArray => {
            const newArr = prevDataArray.map((data) => {
                if(data.blockId === blockId) {
                    return { ...data, title: newTitle }
                }
                return data
            })
            return newArr
        })

        const updateContent = {
            editorType: 1,
            blockId: blockId,
            docs: newTitle
        }
        const sendData = JSON.stringify(updateContent)
        console.log('변경데이터 소켓에 보냄: ', sendData)

        if (socketRef.current !== null && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(sendData)
        }
    }
    //소켓에 블럭내용 전송
    const handleContentChange = (event, blockId) => {
        const newTitle = event.target.value

        setDataArray(prevDataArray => {
            const newArr = prevDataArray.map((data) => {
                if(data.blockId === blockId) {
                    return { ...data, content: newTitle }
                }
                return data
            })
            return newArr
        })

        const updateContent = {
            editorType: 2,
            blockId: blockId,
            docs: newTitle
        }
        const sendData = JSON.stringify(updateContent)
        console.log('변경된거 소켓에 보냄: ', sendData)

        if (socketRef.current !== null && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(sendData)
        }
    }

    //sse 연결
    const EventSource = EventSourcePolyfill
    const [pageEventSource, setPageEventSource] = useState(null)
    
    useEffect(() => {
        const newEventSource = new EventSource('https://mylinking.shop/pages/subscribe/' + data.doc.pageId,
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
            console.log('Page Connected to server!')
        }
      
        newEventSource.addEventListener('connect', (event) => {
            const { data: receivedConnectData } = event
            console.log('page connect event data: ', receivedConnectData)
        })

        //블록 추가/////////////////
        newEventSource.addEventListener('postBlock', (event) => {
            const newData = JSON.parse(event.data)
            const { blockId, title, pageId, content } = newData
            const annotationId = -1
            const annotationResList = [{ annotationId }]
            const data = { blockId, title, pageId, annotationResList, content }
            setDataArray(prevDataArray => [...prevDataArray, data])
        })

        //블록 삭제
        newEventSource.addEventListener('deleteBlock', (event) => {
            const newData = JSON.parse(event.data)
            
            setDataArray(prevState => {
                const filteredArr = prevState.filter(block => block.blockId !== newData.blockId)
                return filteredArr
            })

            setActiveGroupIndex(prevIndex => {
                if (prevIndex >= dataArray.length) {
                return dataArray.length - 1
                } else {
                return prevIndex
                }
            })
        })

        //페이지 삭제
        newEventSource.addEventListener('deletePage', (event) => {
            const newData = JSON.parse(event.data)
            setIsNoPage(newData)
        })

        //주석추가
        newEventSource.addEventListener('postAnnotation', (event) => {
            const newData = JSON.parse(event.data)

            const { annotationId, blockId, content, lastModified, userName, userId } = newData
            const data = { annotationId, blockId, content, lastModified, userName, userId }
            const updatedDataArray = [...dataArray]

            for (let index = 0; index < updatedDataArray.length; index++) {
                if (updatedDataArray[index].blockId === blockId) {
                    updatedDataArray[index].annotationResList.push(data)
                    setDataArray(updatedDataArray)
                    break
                }
            }
        })

        //주석수정
        newEventSource.addEventListener('updateAnnotation', (event) => {
            const newData = JSON.parse(event.data)
            const { annotationId, content } = newData

            const updatedDataArray = dataArray.map(group => {
                const updatedAnnotations = group.annotationResList.map(anno => {
                if (anno.annotationId === annotationId) {
                    return {
                    ...anno,
                    content: content
                    }
                }
                return anno
                })
                return {
                ...group,
                annotationResList: updatedAnnotations
                }
            })
            setDataArray([...updatedDataArray])
        })

        //주석삭제
        newEventSource.addEventListener('deleteAnnotation', (event) => {
            const newData = JSON.parse(event.data)
            const { annotationId } = newData

            setDataArray(prevData => {
                const newDataArray = prevData.map(block => {
                  const updatedAnnotations = block.annotationResList.filter(anno => anno.annotationId !== annotationId)
                  return {
                    ...block,
                    annotationResList: updatedAnnotations
                  }
                })
                return newDataArray
              })
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

        //페이지 이름 수정
        newEventSource.addEventListener('putPageTitle', (event) => {
            const newData = JSON.parse(event.data)
            const { pageId, title } = newData

            setArray(prevState => {
                if(prevState.pageId === pageId) {
                    return { ...prevState, title: title }
                }
                return prevState;
            })
            if(pageId === pageId) {
                setPageTitle(title)
            }
        })

        setPageEventSource(newEventSource)
        
        return() => {
            newEventSource.close()
        }
    }, [data.doc.pageId])
    
    const lookMenuRef = useRef(null)
    const [isLook, setIsLook] = useState(false)
    const [isContent, setIsContent] = useState(false)
    const [activeGroupIndex, setActiveGroupIndex] = useState(null)

    const onClickContent = () => {
        setIsContent(isContent => !isContent)
    }

    useEffect(() => {
        const handleOutsideClose = (e) => {
          if(isLook && (!lookMenuRef.current || !lookMenuRef.current.contains(e.target))) setIsLook(isLook => !isLook)
        }
        document.addEventListener('click', handleOutsideClose)
        
        return () => document.removeEventListener('click', handleOutsideClose)
    }, [isLook])

    //
    const dotMenuRef = useRef(null)
    const [isDot, setIsDot] = useState([])

    useEffect(() => {
        setIsDot(new Array(data.length).fill(false))
    }, [dataArray])

    const [isGroupDot, setIsGroupDot] = useState([])

    useEffect(() => {
        setIsGroupDot(new Array(data.length).fill(false))
    }, [dataArray])

    const onClickGroupDot = (index) => {
        setIsGroupDot(prevState => {
            const newState = [...prevState]
            newState[index] = !newState[index]
            return newState
        })
        setActiveGroupIndex(index)
    }

    useEffect(() => {
        const handleOutsideClose = (e) => {
          if(isGroupDot && (!dotMenuRef.current || !dotMenuRef.current.contains(e.target))) setIsDot(isGroupDot => !isGroupDot)
        }
        document.addEventListener('click', handleOutsideClose)
        
        return () => document.removeEventListener('click', handleOutsideClose)
    }, [isGroupDot])

    //페이지 삭제
    const [isDeletePage, setIsDeletePage] = useState(false)
    const handleDeletePage = () => { 
        setIsDeletePage(isDeletePage => !isDeletePage)
    }

    //주석 추가
    const[isAnnoPop, setIsAnnoPop] = useState(false)
    const handleButtonAnnotation = () => {
        setIsAnnoPop(isAnnoPop => !isAnnoPop)
        setIsGroupDot(prevState => {
            const newState = [...prevState]
            newState[activeGroupIndex] = false
            return newState
        })
    }

    const[isAnnoUpdatePop, setIsAnnoUpdatePop] = useState(false)
    const[annoId, setAnnoId] = useState(0)

    //주석수정
    const onUpdateAnnotation = (annotationId) => {
        setIsAnnoUpdatePop(isAnnoUpdatePop => !isAnnoUpdatePop)
        setAnnoId(annotationId)
        setIsAnnoDot(prevState => {
            const newState = [...prevState]
            newState[activeGroupIndex] = false
            return newState
        })
    }

    //주석 삭제
    const onDeleteAnnotation = (annotationId, i, j) => {
        setIsAnnoDot(prevState => {
            const newState = [...prevState]
            newState[i] = {...newState[i], [j]: !newState[i]?.[j]}
            return newState
        })
        
        api.delete('/annotations/' + annotationId, {
            headers:{
                userId: user.userId,
                projectId: data.projectId
            }
        }) .then(() => {
            const updatedDataArray = dataArray.map(group => {
                const updatedAnnotations = group.annotationResList.filter(anno => anno.annotationId !== annotationId)
                return {
                    ...group,
                    annotationResList: updatedAnnotations
                }
              })
              setDataArray(updatedDataArray)
            })
            .catch(error => {
              console.error(error)
            })
    
        .catch(error => {
        console.error(error)
        })
      }

      //주석 수정
      const handleUpdateAnnotation = (inputValue, newValue) => {
        const newAnnoArr = {
            annotationId: annoId,
            [inputValue]: newValue
          };

          api.put('/annotations', newAnnoArr,{
                headers:{
                    userId: user.userId
                }
            })
            .then(response => {
              const { annotationId } = response.data.data

              const updatedDataArray = dataArray.map(group => {
                const updatedAnnotations = group.annotationResList.map(anno => {
                  if (anno.annotationId === annotationId) {
                    return {
                      ...anno,
                      content: newValue
                    }
                  }
                  return anno;
                })
                return {
                  ...group,
                  annotationResList: updatedAnnotations
                }
              })
              setDataArray(updatedDataArray)
            })
            .catch(error => {
              console.error(error)
            })
        }

    //주석dot
    const [isAnnoDot, setIsAnnoDot] = useState([])

    const onClickAnnoDot = (i, j) => {
        setIsAnnoDot(prevState => {
            const newState = [...prevState]
            newState[i] = {...newState[i], [j]: !newState[i]?.[j]}
            return newState;
        })
    }
      
    //주석추가
    const[annoArr, setAnnoArr] = useState({
        content: '',
        blockId: 0,
        projectId: data.projectId
    })

    const handleInputAnnotation = (inputValue, newValue) => {
        const newAnnoArr = {
            ...annoArr,
            blockId: dataArray[activeGroupIndex].blockId,
            projectId: data.projectId,
            [inputValue]: newValue,
          }

          setAnnoArr(newAnnoArr)

          api
            .post('/annotations', newAnnoArr, {
                headers:{
                    userId: user.userId
                }
            })
            .then(response => {
              const { annotationId, blockId, content, lastModified, userName, userId } = response.data.data
              const newData = { annotationId, blockId, content, lastModified, userName, userId }
              const updatedDataArray = [...dataArray]
              updatedDataArray[activeGroupIndex].annotationResList.push(newData)
              setDataArray(updatedDataArray)
            })
            .catch(error => {
              console.error(error)
            })
        }
    
    //블록 추가
    const textAreaRef = useRef(null)
    useEffect(() => {
        if (textAreaRef.current) {
          textAreaRef.current.style.height = "auto"
          textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px"
        }
      }, [])

    const [divCount, setDivCount] = useState(dataArray.length)
    const [isArrow, setIsArrow] = useState(new Array(divCount).fill(true))
    const arrowToggleMenu = (index) => {
        setIsArrow(prevState => {
          const newState = [...prevState];
          newState[index] = !newState[index];
          return newState;
        });
      };

      //블록복제로 추가된 블록 저장
      const handleBlockChange = (newBlockId, newBlockTitle) => {
        const blockId = newBlockId
        const title = newBlockTitle
        const pageId = data.doc.pageId
        const annotationId = -1
        const annotationResList = [{ annotationId }]
        const newData = { blockId, title, pageId, annotationResList }
        setDataArray(prevDataArray => [...prevDataArray, newData])
    }

    //목차 추가(블록 추가)
    const handleButtonClickTest = () => {
        const updatedBlockArr = {
            ...blockArr,
            order: dataArray.length
        }
        setBlockArr(updatedBlockArr);

        api.post('/blocks', updatedBlockArr, {
            headers:{
                userId: user.userId
            }
        })
            .then(response => {
                const blockId = response.data.data
                const title = ''
                const pageId = data.doc.pageId
                const annotationId = -1
                const annotationResList = [{ annotationId }]
                const content = ''
                const newData = { blockId, title, pageId, annotationResList, content }
                setDataArray(prevDataArray => [...prevDataArray, newData])
            })
            .catch(error => {
                console.error(error)
            })
    } 
    
      const [isAnnotationExpanded, setIsAnnotationExpanded] = useState(Array(dataArray.length).fill(false))
      const annotationToggleMenu = (index) => {
        setIsAnnotationExpanded(prevState => {
          const newState = [...prevState]
          newState[index] = !newState[index]
          return newState
        })
      }

      const adjustTextareaHeight = (textarea) => {
        textarea.style.height = 'auto'; 
        textarea.style.height = `${textarea.scrollHeight}px`; 
      }

      useEffect(() => {
        console.log('Updated dataArray:', dataArray)
      }, [dataArray])

    //블록 & 주석 통합
    const renderBlockAndAnnotation = () => {
        const divs = []

        for (let i = 0; i < dataArray.length; i++) {
            const blockAnnotations = dataArray[i].annotationResList
            const annotationDivs = []

            if(dataArray[i].blockId != -1) {
                const blockTitle = dataArray[i].title
                const content = dataArray[i].content

                if(blockAnnotations.length > 0) {
                    for(let j = 0; j < blockAnnotations.length; j++) {
                        const a = blockAnnotations[j]
          
                        if (a.annotationId === -1) {
                          continue;
                        }

                        annotationDivs.push(
                            <div className="annotation-one-box" key={a.annotationId}>
                              <div className="anno-box">
                              {a.userId == user.userId ? 
                              <div className="anno-total-box">
                                <div>
                                  <img className="doc-content-dot-img" src={dot} onClick={() => onClickAnnoDot(i, j)}/>
                                    <div className={isAnnoDot[i]?.[j] ? "anno-open-box" : "anno-hide-box"}>
                                        <div className="anno-block-box">
                                            <img className="block-img" src={ updateAnno } />
                                            <span className="anno-delete-txt" onClick={() => onUpdateAnnotation(a.annotationId)}>주석 수정</span>
                                        </div>
                                        <div className="anno-block-box">
                                            <img className="block-img" src={ deleteIcon } />
                                            <span className="anno-delete-txt" onClick={() => onDeleteAnnotation(a.annotationId, i, j)}>주석 삭제</span>
                                        </div>
                                        </div>
                                    </div>
                                </div> 
                                : 
                                <div className="anno-total-box">
                                    <div>
                                        <div className="doc-content-dot-img"/>
                                    </div>
                                </div>
                                }
                                <div className="anno-content-box">
                                    <span className="anno-content-txt">{a.content}</span>
                                </div>
                                <div className="anno-info-box">
                                    <span className="anno-info-txt">{a.userName}</span>
                                    <span>{a.lastModified}</span>
                                </div>
                            </div>
                        </div>
                          );
                        }

                        divs.push (
                            <div className="doc-content-totalBox" key={i} >
                                <div className="doc-content-secBox1">
                                {annotationDivs.length > 0 ? 
                                <div className="annotation-length-box">
                                    <span className="annotation-length-txt">{annotationDivs.length}</span>
                                </div>
                                :
                                <div className="annotation-nolength-box"></div>
                                }
                                    <div className="doc-index-box">
                                        <div className="side-index-box"><span>{i+1}.</span></div>
                                        <form acceptCharset="UTF-8">
                                            <textarea 
                                            className='doc-index-txt'
                                            ref={titleRef} 
                                            value={dataArray[i]?.title || ''} 
                                            onChange={(event) => {
                                                handleTitleChange(event, dataArray[i]?.blockId);
                                                adjustTextareaHeight(event.target);
                                            }}
                                            lang="en"
                                            />
                                        </form>
                                        <div className="doc-arrow-imgBox">
                                            <button className="doc-arrowBtn" onClick={() => arrowToggleMenu(i)}>
                                            {isArrow[i] ? (
                                                <div>
                                                    <img className="doc-content-arrow-img" src={arrowBelow} />
                                                </div>
                                            ) : (
                                                <div>
                                                    <img className="doc-content-arrow-img" src={arrowUp} />
                                                </div>
                                            )}
                                            </button>
                                                <div className="doc-dot-imgBox">
                                                    <img className="doc-content-dot-img" src={ dot } onClick={() => {
                                                        if (activeGroupIndex !== null && activeGroupIndex !== i) {
                                                            setIsGroupDot(prevState => {
                                                                const newState = [...prevState];
                                                                newState[activeGroupIndex] = false;
                                                                return newState;
                                                            });
                                                        }
                                                        onClickGroupDot(i)
                                                    }} />
                                                    <div className={isGroupDot[i] ? "dot-open-menu" : "dot-hide-menu"}>
                                                        <div className="add-annotation-box">
                                                            <img className="annotation-img" src={ annotation } />
                                                            <span className="dot-img-txt" onClick={handleButtonAnnotation}>주석 추가</span>
                                                        </div>
                                                        <div className="del-block-box">
                                                            <img className="block-img" src={ reproduction } />
                                                            <span className="dot-img-txt" onClick={() => handleBlockClone(blockTitle, content)}>블록 복제</span>
                                                        </div>
                                                        <div className="del-block-box">
                                                            <img className="block-img" src={ deleteIcon } />
                                                            <span className="dot-delete-txt" onClick={handleDeleteButtonClick}>블록 삭제</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {annotationDivs.length > 0 ? 
                                        <div className={isAnnotationExpanded[i] ? "annotation-view-box" : "annotation-sec-box"} key={i}>
                                            <div className="anno-img-box">
                                            {blockAnnotations.length > 1 ? (
                                                <div>
                                                    {isAnnotationExpanded[i] ? (
                                                    <>
                                                        <img className="doc-content-arrow-img" src={arrowBelow} onClick={() => annotationToggleMenu(i)} />
                                                        <div className="content-over-box">
                                                            {annotationDivs}
                                                        </div>
                                                    </>
                                                    ) : (
                                                    <>
                                                        <img className="doc-content-arrow-img" src={arrowUp} onClick={() => annotationToggleMenu(i)} />
                                                        <div className="anno-view-box">
                                                            <span className="anno-view-txt">주석 {annotationDivs.length}개 전체보기</span>
                                                        </div>
                                                    </>
                                                    )}
                                                </div>
                                                ) : (
                                                <div>
                                                    <div className="doc-content-arrow-img-box" />
                                                    {annotationDivs}
                                                </div>
                                                )}
                                            </div>
                                        </div>
                                        : 
                                        <div className="annotation-blank-box">
                                        </div>    
                                        }
                                    </div>
                                    <div className={isArrow[i] ? "doc-content-secBox2" : "doc-sec-hideBox"}>
                                        <div className="doc-content-box">
                                            <textarea 
                                            className="doc-content-txt"
                                            value={content} 
                                            ref={contentRef} 
                                            onChange={(event) => {
                                                handleContentChange( event, dataArray[i].blockId )
                                                adjustTextareaHeight(event.target);
                                            }}
                                            lang="en"
                                            />
                                        </div>
                                        <div className="content-sec-box"></div>
                                    </div>
                                </div>
                        )
                }
            }
        }
        return divs
    }

    //블록복제
    const[isClone, setIsClone] = useState(false)
    const[groupArr, setGroupArr] = useState([])
    const[cloneTitle, setCloneTitle] = useState('')
    const[cloneContent, setCloneContent] = useState('')

    const handleBlockClone = (blockTitle, content) => {
        api.get('/groups/list?projectId=' + data.projectId, {
            headers: {
                'userId': user.userId
            }
        })
        .then(response => {
            const blockDataArray = response.data.data.reduce((result, group) => {
                const blockData = group.pageResList.filter(item => item.template === 'BLOCK')
                if (blockData.length > 0) {
                  const updatedGroup = { ...group, pageResList: blockData }
                  result.push(updatedGroup)
                }
                return result
              }, [])

            setGroupArr(blockDataArray)
            setCloneTitle(blockTitle)
            setCloneContent(content)
            setIsClone(isClone => !isClone)
            setIsGroupDot(prevState => {
                const newState = [...prevState]
                newState[activeGroupIndex] = false
                return newState
            })
        })
        .catch(error => {
          console.error(error)
        })
    }

    //블록삭제
    const handleDeleteButtonClick = () => { 
        api.delete('/blocks/' + dataArray[activeGroupIndex].blockId, {
            headers:{
                userId: user.userId
            }
        }) .then(() => {
            if (activeGroupIndex !== null) {
                setDataArray(prevState => {
                    const newArr = [...prevState]
                    newArr.splice(activeGroupIndex, 1)
                    return newArr
                });
                console.log(activeGroupIndex)
                setActiveGroupIndex(prevIndex => prevIndex - 1)
                setIsGroupDot(prevState => {
                    const newState = [...prevState]
                    newState[activeGroupIndex] = false
                    return newState
                })
            }

        })
        .catch(error => {
        console.error(error)
        })
    }

    //사이드바에서 블록추가
    const onAddTitle = (inputName, newValue) => {
        setBlockArr(prevBlockArr => ({
            ...prevBlockArr,
            order: dataArray.length,
            title: newValue
        }))
        
        if (inputName === 'title') {
            setTitle(newValue)
        }
        
        setDivCount(prevCount => prevCount + 1)
        setIsArrow(prevState => {
          const newState = [...prevState, false]
          return newState
        })

        api.post('/blocks', {
            ...blockArr,
            title: newValue
          }, {
            headers:{
                userId: user.userId
            }
          })
            .then(response => {
                const blockId = response.data.data
                const title = newValue
                const pageId = blockArr.pageId
                const annotationId = -1
                const annotationResList = [{ annotationId }]
                const newData = { blockId, title, pageId, annotationResList }
                setDataArray(prevDataArray => [...prevDataArray, newData])
            })
            .catch(error => {
                console.error(error)
            })
    }

    return(
        <div className="doc-total-box" style={{ minWidth: '1200px', minHeight: '600px' }}>
            <div className="doc-header-box" ref={ lookMenuRef }>
                <div className="look-box">
                    <div className="look-sec-box" >
                        <PageNoti data={notiArray} pageTitle={pageTitle} pageId={id} projectId={projectId}/>
                    </div>
                </div>

                <div className="content-box">
                    {isContent ? <span className="contentOpen-txt" onClick={ onClickContent }>목차닫기</span> : <span className="contentHide-txt" onClick={ onClickContent }>목차보기</span>}
                </div>
                <div className={isContent ? "contentOpen-box" : "contendHide-box"}>
                    <Content onAddTitle={onAddTitle} dataArray={dataArray} setDataArray={setDataArray} setActiveGroupIndex={setActiveGroupIndex} pageId={id}/>
                </div>
                
                <div className="doc-title-box">
                    <span className='doc-title-txt'>{pageTitle}</span>
                </div>
                <div className="doc-trash-box">
                    <img className="doc-trashImg" src={ trash } onClick={handleDeletePage}/>
                </div>
            </div>

            <div className="doc-content-totalBox">
                <div className="content-anno-box">
                    <div>
                        {renderBlockAndAnnotation()}
                    </div>
                </div>
                
                <div className="doc-content-imgBox">
                    <img className="doc-content-plus-img" src={ plus } onClick={ handleButtonClickTest }/>
                    <div className="doc-content-plus-box"><span className="doc-content-plus-txt">목차 추가</span></div>
                </div>
            </div>
            {isAnnoPop ? <AddAnnotation onClose={setIsAnnoPop} onButtonClick={handleInputAnnotation} /> : <></>}
            {isAnnoUpdatePop ? <UpdateAnnotation onClose={setIsAnnoUpdatePop} onButtonClick={handleUpdateAnnotation} /> : <></>}
            {isDeletePage ? <PageDeleteModal isDeletePage={isDeletePage} setIsDeletePage={setIsDeletePage} onClose={handleDeletePage} pageId={id} /> : <></> }
            {isNoPage != null ? <PageNoPopup isNoPage={isNoPage} setIsNoPage={setIsNoPage} /> : <></> }
            {isClone ? <BlockCloneModal isOpen={isClone} onClose={setIsClone} pageId={id} projectId={projectId} groupArr={groupArr} title={cloneTitle} content={cloneContent} onValueBlockChange={handleBlockChange}/> : <></>}
        </div>

    )
}

export default Document
