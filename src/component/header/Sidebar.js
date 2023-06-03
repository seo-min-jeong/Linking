import React, { useEffect, useRef, useState } from "react"
import { NativeEventSource, EventSourcePolyfill } from 'event-source-polyfill';
import './Sidebar.css'
import { useNavigate } from "react-router-dom"
import api from '../../utils/api'
import { Resizable } from 'react-resizable-element';
import { useCookies } from 'react-cookie';

import AddGroup from "./AddGroup"
import AddDoc from "./AddDoc"
import GroupDeletePopup from "./GroupDeletePopup"
import GroupUpdatePopup from "./GroupUpdatePopup"
import Document from "../Document";
import SettingModal from "./SettingModal";
import PageUpdatePopup from "./PageUpdatePopup";

import ham from "../../icon/ham.png"
import close from "../../icon/close.png"
import sideHome from "../../icon/home.png"
import arrowBelow from "../../icon/arrowBelow.png"
import arrowUp from "../../icon/arrowUp.png"
import dot from "../../icon/dot.png"
import file from "../../icon/file.png"
import doc from "../../icon/doc.png"
import trash from "../../icon/trash.png"
import arrowUpDown from "../../icon/arrowUpDown.png"
import folder from "../../icon/folder.png"
import plus from "../../icon/plus2.png"
import pencil from "../../icon/pencil.png"
import deleteIcon from "../../icon/deleteIcon.png"
import setting from "../../icon/setting.png"
import updatePageIcon from "../../icon/updateAnno.png"
import updateIcon from "../../icon/updateIcon.png"
import addDoc from "../../icon/addDoc.png"

function Sidebar(props) {
    const { data, projectId, isOpen, setMenu, beginDate, dueDate, partList } = props;
    const user = JSON.parse(localStorage.getItem('user'))
    const [cookies] = useCookies(['session'])
    const [groupArr, setGroupArr] = useState([])
    const [isEndPage, setEndPage] = useState()

    let now = new Date()
    let year = now.getFullYear()
    let month = now.getMonth() + 1
    let day = now.getDate()

    const EventSource = EventSourcePolyfill
    const [eventSource, setEventSource] = useState(null);
    
    const toggleMenu = () => {
        if(isOpen == false) {
            setMenu(true)
            api.get('/groups/list?projectId=' + projectId, {
                headers: {
                    'userId': user.userId
                }
            })
                    .then(response => {
                      console.log(response)
                      setGroupArr(response.data.data)
                    })
                    .catch(error => {
                      console.error(error)
                    })
                
                    const newEventSource = new EventSource('http://43.201.231.51:8080/groups/subscribe?projectId=' + projectId,
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
                    console.log('Sidebar Connected to server!')
                  }
        
                  newEventSource.addEventListener('connect', (e) => {
                    const { data: receivedConnectData } = e;
                    console.log('sidebar connect event data: ',receivedConnectData);  // "connected!"
                });
        
                //그룹생성
                  newEventSource.addEventListener('postGroup', (event) => {
                    const newData = JSON.parse(event.data);
                    console.log(newData)
        
                    setGroupArr(prevGroupArr => [
                        ...prevGroupArr,
                        {
                          name: newData.name,
                          projectId: projectId,
                          groupId: newData.groupId,
                          pageResList: []
                        }
                    ])
                })
        
                //그룹수정
                newEventSource.addEventListener('putGroupName', (event) => {
                    const newData = JSON.parse(event.data);
                    console.log(newData)
        
                    setGroupArr(prevState => {
                        return prevState.map(group => {
                            if (group.groupId === newData.groupId) {
                              return { ...group, name: newData.name };
                            }
                            return group;
                          })
                        })
                })
        
                //그룹삭제
                newEventSource.addEventListener('deleteGroup', (event) => {
                    const newData = JSON.parse(event.data);
                    console.log(newData)
                    
                    setGroupArr(prevState => {
                        const filteredArr = prevState.filter(group => group.groupId !== newData.groupId);
                        return filteredArr;
                      })
                    
                      setActiveGroupIndex(prevIndex => {
                        if (prevIndex >= groupArr.length) {
                          return groupArr.length - 1
                        } else {
                          return prevIndex;
                        }
                    })
                })
        
                //페이지 추가
                newEventSource.addEventListener('postPage', (event) => {
                    const newData = JSON.parse(event.data);
                    const { pageId, groupId, title, template, annoNotCnt } = newData
        
                    setGroupArr(prevGroupArr => {
                        return prevGroupArr.map((group, index) => {
                            if (group.groupId === groupId) {
                              return {
                                ...group,
                                pageResList: [...group.pageResList, newData]
                              }
                            }
                            return group;
                          })
                      })
                })

                //페이지 수정
                newEventSource.addEventListener('putPageTitle', (event) => {
                    const newData = JSON.parse(event.data);
                    const { pageId, groupId, title } = newData
        
                    setGroupArr(prevGroupArr => {
                        return prevGroupArr.map((group) => {
                          if (group.groupId === groupId) {
                            const newPageResList = group.pageResList.map((page) => {
                              if (page.pageId === pageId) {
                                return { ...page, title: title };
                              }
                              return page;
                            });
                            return {
                              ...group,
                              pageResList: newPageResList,
                            };
                          }
                          return group;
                        });
                    });
                })

                //페이지 삭제
                newEventSource.addEventListener('deletePage', (event) => {
                    const newData = JSON.parse(event.data)

                    setGroupArr(prevGroupArr => {
                        const updatedGroupArr = prevGroupArr.map(group => {
                          if (group.groupId === newData.groupId) {
                            const updatedPageResList = group.pageResList.filter(page => page.pageId !== newData.pageId);
                            return {
                              ...group,
                              pageResList: updatedPageResList
                            };
                          } 
                          return group;
                        });
                        return updatedGroupArr;
                      });
                })

                //주석 수 증가
                newEventSource.addEventListener('postAnnotation', (event) => {
                    const newData = JSON.parse(event.data);
                    const { pageId, groupId } = newData
        
                    setGroupArr(prevGroupArr => {
                        return prevGroupArr.map((group) => {
                          if (group.groupId === groupId) {
                            const newPageResList = group.pageResList.map((page) => {
                              if (page.pageId === pageId) {
                                return { ...page, annoNotCnt: page.annoNotCnt+1 };
                              }
                              return page;
                            });
                            return {
                              ...group,
                              pageResList: newPageResList,
                            };
                          }
                          return group;
                        });
                    });
                })

                //주석 수 감소
                newEventSource.addEventListener('deleteAnnotation', (event) => {
                    const newData = JSON.parse(event.data);
                    const { pageId, groupId } = newData
        
                    setGroupArr(prevGroupArr => {
                        return prevGroupArr.map((group) => {
                          if (group.groupId === groupId) {
                            const newPageResList = group.pageResList.map((page) => {
                              if (page.pageId === pageId) {
                                return { ...page, annoNotCnt: page.annoNotCnt-1 };
                              }
                              return page;
                            });
                            return {
                              ...group,
                              pageResList: newPageResList,
                            };
                          }
                          return group;
                        });
                    });
                })

                //eventSource 저장
                setEventSource(newEventSource)

        } else if(isOpen == true) {
            setMenu(false)
            
            setIsGroup(false)
            setIsDoc(false)
            setIsDeleteGroup(false)
            setIsUpdateGroup(false)

            eventSource.close();
            console.log('sidebar connection close')
            setEventSource(null);
        }
    }

    const [ grab, setGrab ] = React.useState(null)

    const openDotRef = useRef(null);
    const [isArrow, setIsArrow] = useState(false);
    const [isDot, setIsDot] = useState(false);
    const [isGroup, setIsGroup] = useState(false);
    const [isDoc, setIsDoc] = useState(false);
    const [isDeleteGroup, setIsDeleteGroup] = useState(false);
    const [isUpdateGroup, setIsUpdateGroup] = useState(false);

    const [isGroupDot, setIsGroupDot] = useState(new Array(groupArr.length).fill(false));
    const [expandedGroups, setExpandedGroups] = useState(Array(groupArr.length).fill(false));
    const [activeGroupIndex, setActiveGroupIndex] = useState(groupArr.length);

    const navigate = useNavigate();

    //홈으로 이동
    const onClickHome = () => {
        // navigate('/home')
        if(isEndPage != null) {
            api.get('/pages/unsubscribe/'+ isEndPage, {
                headers: {
                    'userId': user.userId,
                    'projectId': projectId
                }
            }) .then(() => {
                setEndPage(null)
                console.log("페이지 종료 api 넘겨줌")
            })
        }
        setIsGroup(false)
        setIsDoc(false)
        setIsDeleteGroup(false)
        setIsUpdateGroup(false)
        setMenu(false)
        eventSource.close();
        console.log('sidebar connection close')
        setEventSource(null)

        api.get('/todos/list/monthly/project/' + projectId + '/' + year + '/' + month)
            .then(response => {
                const todoMonth  = response.data.data
                if(todoMonth === null) {
                    todoMonth = []
                }

                api.get('/todos/list/today/project/' + projectId + '/urgent')
                .then(response => {
                    const todoDay  = response.data.data
                    if(todoDay === null) {
                        todoDay = []
                    }

                    api.get('/assigns/ratio/project/' + projectId)
                    .then(response => {
                      const graph  = response.data.data
                      const totalTodo  = { todoMonth: todoMonth, todoDay: todoDay, beginDate: beginDate, dueDate: dueDate, graph:graph, newProjectId:projectId }
                      navigate(process.env.PUBLIC_URL + '/home', {state: totalTodo})
                    })
                    .catch(error => {
                      console.error(error);
                    })
                    const totalTodo  = { todoMonth: todoMonth, todoDay: todoDay, beginDate: beginDate, dueDate:dueDate, newProjectId:projectId }
                    navigate(process.env.PUBLIC_URL + '/home', {state: totalTodo})
                })
                .catch(error => {
                    console.error(error);
                })
            })
            .catch(error => {
                console.error(error);
            })
    }

    //할일페이지로 이동
    const onClickWork = () => {
        api.get('/todos/list/monthly/project/' + projectId + '/' + year + '/' + month)
        .then(response => {
            const data  = response.data.data
            if(data === null) {
                data = []
            }
            const info  = { data: data, projectId: projectId, partList: partList }
            navigate(process.env.PUBLIC_URL + '/calendar', {state: info})
        })
        .catch(error => {
            console.error(error)
        })

        if(isEndPage != null) {
            api.get('/pages/unsubscribe/'+ isEndPage, {
                headers: {
                    'userId': user.userId,
                    'projectId': projectId
                }
            }) .then(() => {
                setEndPage(null)
            })
        }
        
        setIsGroup(false)
        setIsDoc(false)
        setIsDeleteGroup(false)
        setIsUpdateGroup(false)
        setMenu(false)
        eventSource.close();
        console.log('sidebar connection close')
        setEventSource(null)
    }

    const arrowToggleMenu = () => {
        setIsArrow(isArrow => !isArrow);
    }

    const onClickDot = () => {
        setIsDot(isDot => !isDot);
    }
    const onClickGroupDot = (index) => {
        setIsGroupDot(prevState => {
            const newState = [...prevState]; 
            newState[index] = !newState[index]; 
            return newState;
        });
        setActiveGroupIndex(index);
    }
    const onArrowClick = (groupIndex) => {
        const newExpandedGroups = [...expandedGroups];
        newExpandedGroups[groupIndex] = !newExpandedGroups[groupIndex];
        setExpandedGroups(newExpandedGroups);
    }

    //추가, 수정, 삭제 버튼
    const onAddGroup = () => {
        setIsDot(false);
        setIsDoc(false)
        setIsDeleteGroup(false)
        setIsUpdateGroup(false)
        setIsGroup(isGroup => !isGroup);
    }
    const onAddDoc = () => {
        setIsGroupDot(false)
        setIsGroup(false)
        setIsDeleteGroup(false)
        setIsUpdateGroup(false)
        setIsDoc(isDoc => !isDoc)
    }
    const onDeleteGroup = () => {
        setIsGroupDot(false)
        setIsGroup(false)
        setIsDoc(false)
        setIsUpdateGroup(false)
        setIsDeleteGroup(isDeleteGroup => !isDeleteGroup)
    }
    const onUpdateGroup = () => {
        setIsGroupDot(false)
        setIsGroup(false)
        setIsDoc(false)
        setIsDeleteGroup(false)
        setIsUpdateGroup(isUpdateGroup => !isUpdateGroup)
    }
    
    ////
    //문서 이동
    const onClickDocument = (i, j) => {
        if(isEndPage != null) {
            api.get('/pages/unsubscribe/'+ isEndPage, {
                headers: {
                    'userId': user.userId,
                    'projectId': projectId
                }
            }) .then(() => {
                setEndPage(null)
                console.log("페이지 종료 api 넘겨줌")
            })
        }

        api.get('/pages/'+ groupArr[i].pageResList[j].pageId, {
            headers: {
                'userId': user.userId,
                'projectId': groupArr[i].projectId
            }
        })
            .then(response => {
                console.log(response.data.data.blockResList)
                if(groupArr[i].pageResList[j].template == 'BLOCK') {
                    if(response.data.data.blockResList[0].blockId === -1) {
                        const doc = {blockResList: [], pageCheckResList: response.data.data.pageCheckResList, groupId: response.data.data.groupId, title: response.data.data.title, pageId: response.data.data.pageId}
                        const data  = { isOpen: isOpen, doc: doc, projectId: projectId }
                        navigate(process.env.PUBLIC_URL + '/document/' + groupArr[i].pageResList[j].pageId, {state: data});
                    } else {
                        const data  = { isOpen: isOpen, doc: response.data.data, projectId: projectId }
                        navigate(process.env.PUBLIC_URL + '/document/' + groupArr[i].pageResList[j].pageId, {state: data})
                    }
                } else {
                    const data  = { isOpen: isOpen, doc: response.data.data, projectId: projectId }
                    navigate(process.env.PUBLIC_URL + '/blankPage/' + groupArr[i].pageResList[j].pageId, {state: data})
                }

                setMenu(false)
                eventSource.close()
                console.log('sidebar connection close')
                setEventSource(null)

                setEndPage(groupArr[i].pageResList[j].pageId)
            })
            .catch(error => {
                console.error(error)
            })
    }

    // useEffect(() => {
    //     const handleOutsideClose = (e) => {
    //       if(isDot && (!openDotRef.current || !openDotRef.current.contains(e.target))) setIsDot(isDot => !isDot);
    //     };
    //     document.addEventListener('click', handleOutsideClose);
        
    //     return () => document.removeEventListener('click', handleOutsideClose);
    // }, [isDot]);

    ///////////////////////////////////////////////////////////////////////
    //그룹추가
    const handleButtonClick = (inputName, newValue) => {
        if (inputName === 'newGroup') {
          setGroupArr(prevGroupArr => [
            ...prevGroupArr,
            {
              name: newValue.name,
              projectId: newValue.projectId,
              groupId: newValue.groupId,
              pageResList: newValue.pageResList
            }
          ]);
        }
      };
      const handleDocButtonClick = (inputName, newValue) => {
        if (inputName === 'documents' && activeGroupIndex !== null) {
            setGroupArr(prevGroupArr => {
              return prevGroupArr.map((group, index) => {
                if (index === activeGroupIndex) {
                  return {
                    ...group,
                    pageResList: [...group.pageResList, newValue]
                  };
                }
                return group;
              });
            });
          }
      };

      useEffect(() => {
        console.log(groupArr);
      }, [groupArr]);

      //그룹수정
      const handleUpdateButtonClick = (inputName, newValue) => {
        if (inputName === 'name' && activeGroupIndex !== null) {
            setGroupArr(prevState => {
                
              const newArr = [...prevState];
              newArr[activeGroupIndex] = { ...newArr[activeGroupIndex], name: newValue };
              return newArr;
            });

            const updateGroup = {
                name: newValue,
                groupId: groupArr[activeGroupIndex].groupId,
            } 
            api.put('/groups', updateGroup, {
                headers: {
                    'userId': user.userId,
                }
            })
            .then(response => {
                console.log(response.data);
            })
            .catch(error => {
                console.error(error)
            })
          } 
      };

      //그룹삭제
      const handleDeleteButtonClick = () => { 
        api.delete('/groups/' + groupArr[activeGroupIndex].groupId, {
            headers: {
                'userId': user.userId,
            }
        })
            .catch(error => {
              console.error(error)
            })
        if (activeGroupIndex !== null) {
            setGroupArr(prevState => {
              const newArr = [...prevState];
              newArr.splice(activeGroupIndex, 1);
              return newArr;
            })
            setActiveGroupIndex(prevIndex => prevIndex - 1);
          }
      };

    useEffect(() => {
        document.addEventListener("click", handleClickOutside);
        return () => {
          document.removeEventListener("click", handleClickOutside);
        };
      }, []);
      
      const handleClickOutside = (event) => {
        const clickedElement = event.target;
        const groupDotBox = document.querySelectorAll(".side-groupDot-box");
      
        let clickedInsideGroup = false;
        groupDotBox.forEach((box) => {
          if (box.contains(clickedElement)) {
            clickedInsideGroup = true;
          }
        });
      
        if (!clickedInsideGroup) {
          setIsGroupDot([]);
        }
      };

    //그룹 이동
    const[isDragGroup, setIsDragGroup] = useState(false)
    const newGroupArr = groupArr.map(group => ({
        groupId: group.groupId,
        pageList: group.pageResList.map(page => ({
        pageId: page.pageId
        }))
    }));
    const onClickDropDragNow = () => {
        setIsDragGroup(isDragGroup => !isDragGroup)
    }
    const onClickGroupDrag = () => {
        console.log(newGroupArr)
        api.put('/groups/order', newGroupArr, {
            headers: {
                'userId': user.userId,
            }
        })
            .catch(error => {
                console.error(error)
            })
            setIsDragGroup(false)
    }
    
    const _onDragOver = e => {
        e.preventDefault();
    }
    const _onDragStart = e => {
        setGrab(e.target);
        e.target.classList.add("grabbing");
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/html", e.target);
    }
    const _onDragEnd = e => {
        e.target.classList.remove("grabbing");
        e.dataTransfer.dropEffect = "move";
    }
    const _onDrop = e => {
        let grabPosition = Number(grab.dataset.position);
        let targetPosition = Number(e.target.dataset.position);

        let _list = [ ...groupArr ];
        _list[grabPosition] = _list.splice(targetPosition, 1, _list[grabPosition])[0];

        setGroupArr(_list);
    }
    const _onDrop2 = e => {
        let grabPosition = Number(grab.dataset.position);
        let targetPosition = Number(e.target.dataset.position);

        let _list = [ ...groupArr ];
        let group = { ..._list[activeGroupIndex] };
        group.pageResList[grabPosition] = group.pageResList.splice(targetPosition, 1, group.pageResList[grabPosition])[0];
        _list[activeGroupIndex] = group;

        setGroupArr(_list);
    }

    //환경설정 버튼
    const [isSetting, setIsSetting] = useState(false)
    const [settingData, setSettingData] = useState()
    const onClickSetting= () => {
        setMenu(false)
        api.get('/push-settings/web/' + user.userId)
        .then(response => {
            console.log(response.data.data)
            setSettingData(response.data.data)
        })
        .catch(error => {
            console.error(error)
        })

        setIsSetting(true)
    }

    //문서이름 변경
    const [isUpdatePage, setIsUpdatePage] = useState(false)
    const [activePagegroupIndex, setActivePagegroupIndex] = useState()
    const [activePageIndex, setActivePageIndex] = useState()
    const [pageName, setPageName] = useState()
    const onUpdatePage = (i, j) => {
        setActivePagegroupIndex(i)
        setActivePageIndex(j)
        setPageName(groupArr[i].pageResList[j].title)
        setIsGroupDot(false)
        setIsGroup(false)
        setIsDoc(false)
        setIsDeleteGroup(false)
        setIsUpdateGroup(false)
        setIsUpdatePage(isUpdatePage => !isUpdatePage)
    }

    const handleUpdatePageButtonClick = (inputName, newValue) => {
        if (inputName === 'title' && activePageIndex !== null) {
            setGroupArr(prevState => {
                const newArr = prevState.map((group, groupIndex) => {
                    if (groupIndex === activePagegroupIndex) {
                      const newPageResList = group.pageResList.map((page, pageIndex) => {
                        if (pageIndex === activePageIndex) {
                          return { ...page, title: newValue }
                        }
                        return page
                      });
                      return { ...group, pageResList: newPageResList }
                    }
                    return group
                  })
                  return newArr
                })
            
                const updatePage = {
                    projectId: projectId,
                    title: newValue,
                    groupId: groupArr[activePagegroupIndex].groupId,
                    pageId: groupArr[activePagegroupIndex].pageResList[activePageIndex].pageId
                } 
                console.log(updatePage)
                api.put('/pages', updatePage, {
                    headers: {
                        'userId': user.userId,
                    }
                })
                .then(response => {
                    console.log(response.data);
                })
                .catch(error => {
                    console.error(error)
                })
            
            }
      }

    return(
        <div className="side-menu" >
                <div className={isOpen ? "show-menu" : "hide-menu"} >
                    {isOpen ? <img className="open-ham" src={ close } onClick={ toggleMenu } /> : <img className="ham" src={ ham } onClick={ toggleMenu } />}
                    <div className="menu-bar">
                        <div className="side-project">
                            <span className="side-project-txt">{data}</span>
                            <div className="sideHome-img">
                                <img className="sideHome" src={ sideHome } onClick={ onClickHome } />
                            </div>
                        </div>
                        <div className="side-work">
                            <div><span className="side-work-txt">작업</span></div>
                            <div className="side-smallTxt-box">
                                <div className="side-work-smallBox"><span className="side-work-smallTxt" onClick={ onClickWork }>할 일</span></div>
                                {/* <div className="side-work-smallBox"><span className="side-work-smallTxt">간트차트</span></div> */}
                            </div>
                        </div>
                        <div className="side-doc">
                            <div className="side-sec-doc"> 
                                <span className="side-doc-txt">문서</span>
                                <div className="side-arrowDot-box" ref={ openDotRef }>
                                    <div className="side-dotImg-box">
                                        <img className="side-plusImg" src = { plus } onClick={ onClickDot }/>
                                        <div className={isDot ? "sideDot-openMenu" : "sideDot-hideMenu"}>
                                            <div className="side-addSec-box1" onClick={ onAddGroup }> 
                                                <div className="file-img-box"><img className="file-img" src={ folder } /></div>
                                                <span className="side-add-txt">그룹 추가</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {isGroup && <AddGroup onClose={setIsGroup} projectId={projectId} order={groupArr.length} onButtonClick={handleButtonClick} />}
                                </div>
                            </div>
                            <div className="side-group-box">
                                {isDragGroup ? 
                                    <div>
                                        {groupArr.map((group, i) => (
                                            <div 
                                            key={i}
                                            >
                                            <span className="side-groupTxt">{group.name}</span>
                                            <div 
                                            className="side-groupDot-box"
                                            data-position={i}
                                            onDragOver={_onDragOver}
                                            onDragStart={_onDragStart}
                                            onDragEnd={_onDragEnd}
                                            onDrop={_onDrop}
            
                                            draggable
                                            style={{
                                            backgroundColor: group.backgroundColor,
                                            color: group.color,
                                            fontSize: "bold"
                                            }}
                                            >
                                                {group.pageResList.length > 0 && (
                                                    <button className="side-arrowBtn" onClick={() => onArrowClick(i)}>
                                                        {expandedGroups[i] ?
                                                        <div className="side-arrowBox"><img className="arrowBelow-img" src={arrowBelow} /></div>
                                                        : <div className="side-arrowBox"><img className="arrowUp-img" src={arrowUp} /></div>}
                                                    </button>
                                                )}
                                                <img className="side-dotImg" src={dot} onClick={() => {
                                                    if (activeGroupIndex !== null && activeGroupIndex !== i) {
                                                        setIsGroupDot(prevState => {
                                                            const newState = [...prevState];
                                                            newState[activeGroupIndex] = false;
                                                            return newState;
                                                        });
                                                    }
                                                    onClickGroupDot(i)
                                                }} />
                                                <div className={isGroupDot[i] ? "sideGroup-openMenu" : "sideGroup-hideMenu"}>
                                                    <div className="side-addSec-box3" onClick={() => onAddDoc(i)}>
                                                        <div className="file-img-box"><img className="file-add-img" src={addDoc} /></div>
                                                        <span className="side-add-txt">문서 추가</span>
                                                    </div>
                                                    <div className="side-addSec-box3" onClick={() => onUpdateGroup(i)}>
                                                        <div className="file-img-box"><img className="file-img2" src={updateIcon} /></div>
                                                        <span className="side-add-txt">그룹 이름 수정</span>
                                                    </div>
                                                    <div className="side-addSec-box3" onClick={onDeleteGroup}>
                                                        <div className="file-img-box"><img className="file-img2" src={deleteIcon} /></div>
                                                        <span className="side-delete-txt">그룹 삭제</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={expandedGroups[i] ? "side-doc-openBox" : "side-doc-hideBox"}>
                                                <div className="side-doc-box">
                                                    {group.pageResList.map((doc, j) => (
                                                        <div 
                                                        key={j} 
                                                        data-position={j}
                                                        onClick={() => onClickDocument(i, j)}

                                                        onDragOver={_onDragOver}
                                                        onDragStart={_onDragStart}
                                                        onDragEnd={_onDragEnd}
                                                        onDrop={_onDrop2}

                                                        draggable
                                                        style={{
                                                        backgroundColor: group.backgroundColor,
                                                        color: group.color,
                                                        fontSize: "bold",
                                                        display:"flex"
                                                        }}
                                                        >
                                                            <span className="side-doc-secBox">{doc.title}</span>
                                                            <div className="side-pageImg-box">
                                                                <img className="side-pageImg" src={updatePageIcon} onClick={() => onUpdatePage(i, j)}/>
                                                            </div>
                                                            {/* <div className="sideGroup-openMenu">
                                                                <div className="side-addSec-box3">
                                                                    <div className="file-img-box"><img className="file-img2" src={doc} /></div>
                                                                    <span className="side-add-txt">문서 수정</span>
                                                                </div>
                                                            </div> */}
                                                        </div>
                                                    ))}

                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    </div>
                                    :
                                    <div>
                                    {groupArr.map((group, i) => (
                                        <div key={i} className="group-ndrag-box" >
                                            <span className="side-groupTxt">{group.name}</span>
                                            <div className="side-groupDot-box">
                                                {group.pageResList.length > 0 && (
                                                    <button className="side-arrowBtn" onClick={() => onArrowClick(i)}>
                                                        {expandedGroups[i] ?
                                                        <div className="side-arrowBox"><img className="arrowBelow-img" src={arrowBelow} /></div>
                                                        : <div className="side-arrowBox"><img className="arrowUp-img" src={arrowUp} /></div>}
                                                    </button>
                                                )}
                                                <img className="side-dotImg" src={dot} onClick={() => {
                                                    if (activeGroupIndex !== null && activeGroupIndex !== i) {
                                                        setIsGroupDot(prevState => {
                                                            const newState = [...prevState];
                                                            newState[activeGroupIndex] = false;
                                                            return newState;
                                                        });
                                                    }
                                                    onClickGroupDot(i)
                                                }} />
                                                <div className={isGroupDot[i] ? "sideGroup-openMenu" : "sideGroup-hideMenu"}>
                                                    <div className="side-addSec-box3" onClick={() => onAddDoc(i)}>
                                                        <div className="file-img-box"><img className="file-add-img" src={addDoc} /></div>
                                                        <span className="side-add-txt">문서 추가</span>
                                                    </div>
                                                    <div className="side-addSec-box3" onClick={() => onUpdateGroup(i)}>
                                                        <div className="file-img-box"><img className="file-img2" src={updateIcon} /></div>
                                                        <span className="side-add-txt">그룹 이름 수정</span>
                                                    </div>
                                                    <div className="side-addSec-box3" onClick={onDeleteGroup}>
                                                        <div className="file-img-box"><img className="file-img2" src={deleteIcon} /></div>
                                                        <span className="side-delete-txt">그룹 삭제</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={expandedGroups[i] ? "side-doc-openBox" : "side-doc-hideBox"}>
                                                <div className="side-doc-box">
                                                    {group.pageResList.map((doc, j) => (
                                                        <div key={j} className="side-anno-box">
                                                            <span className="side-doc-secBox" onClick={() => onClickDocument(i, j)}>{doc.title}</span>

                                                            <div className="side-pageImg-box">
                                                                <img className="side-pageImg" src={updatePageIcon} onClick={() => onUpdatePage(i, j)}/>
                                                            </div>

                                                            {doc.annoNotCnt > 0 && (
                                                            <div className="side-annotation-box">
                                                                <span className="side-anno-txt">{doc.annoNotCnt}</span>
                                                            </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    </div>}
                                {isDoc && <AddDoc onClose={setIsDoc} onButtonClick={handleDocButtonClick} groupId={groupArr[activeGroupIndex].groupId} order={groupArr[activeGroupIndex].pageResList.length} />}
                                {isDeleteGroup && <GroupDeletePopup onClose={setIsDeleteGroup} onButtonClick={handleDeleteButtonClick} />}
                                {isUpdateGroup && <GroupUpdatePopup onClose={setIsUpdateGroup} onButtonClick={handleUpdateButtonClick} name={groupArr[activeGroupIndex].name}/>}
                                {isUpdatePage && <PageUpdatePopup onClose={setIsUpdatePage} onButtonClick={handleUpdatePageButtonClick} name={pageName}/>}
                            </div>
                        </div>
                        <div className="side-bottomBox">
                            <div className="side-setting-box"><img className="setting-img" src={ setting } onClick={ onClickSetting }/></div>
                            {isSetting ? <SettingModal onClose={ setIsSetting} settingData={ settingData } /> : <></>}
                            {isDragGroup ? <div className="side-arrowUpDown-box"><span className="side-arrowUpDown-txt" onClick={onClickGroupDrag}>Done</span></div>: <div className="side-arrowUpDown-box"><img className="arrowUpDown-img" src={ arrowUpDown } onClick={onClickDropDragNow} /></div>}
                        </div>
                    </div>
                </div>
        </div>
    );
}

export default Sidebar;
