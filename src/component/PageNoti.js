import React, { useState, useRef, useEffect } from "react"
import api from '../utils/api'
import { useCookies } from 'react-cookie'

import lookOk from "./icon/look-ok.png"
import lookNo from "./icon/look-no.png"
import look from "../icon/person.png"
import bellRed from "../icon/bellRed.png"
import bellGreen from "../icon/bellGreen.png"
import arrowtriangle from "../icon/arrowtriangle.png"
import totalUser from "../icon/ring2.png"
import lookNow from "../icon/look-now.png"
import { EventSourceContext } from "./Document"

function PageNoti(props) {
    const{ data, pageId, projectId, pageTitle } = props
    const user = JSON.parse(localStorage.getItem('user'))
    const [isLook, setIsLook] = useState(false);
    // const [cookies] = useCookies(['session'])

    const [newData, setData] = useState(data)
    const [newPageId, setPageId] = useState(pageId)
    const [newProjectId, setProjectId] = useState(projectId)
    const [newPageTitle, setPageTitle] = useState(pageTitle)

    useEffect(() => {
        const{ data, pageId, projectId, pageTitle } = props
        setData(data)
        setPageTitle(pageTitle)
        setPageId(pageId)
        setProjectId(projectId)
        setArray(data)
    }, [props])

    const[array, setArray] = useState(data)
    const [isNoti, setIsNoti] = useState(false);
    const [isSendNoti, setIsSendNoti] = useState(false);
    const [activeGroupIndex, setActiveGroupIndex] = useState(null);
    const [isGroupDot, setIsGroupDot] = useState(new Array(newData.length).fill(false));

    const onClickGroupDot = (index) => {
        setIsGroupDot((prevState) => {
        const newState = [...prevState];
        newState[index] = !newState[index];
        return newState;
        });
        setActiveGroupIndex(index);
    };

    const onClickArrow = (i) => {
        if (activeGroupIndex !== null && activeGroupIndex !== i) {
          setIsGroupDot((prevState) => {
            const newState = [...prevState];
            newState[activeGroupIndex] = false;
            return newState;
          });
        }
        onClickGroupDot(i);
        setTotalAlarm(false)
    };

    const onClickLook = () => {
        setIsSendNoti(false);
        setIsNoti(false);
        setIsLook(isLook => !isLook);
        setActiveGroupIndex(null); 
        setIsGroupDot(new Array(newData.length).fill(false)); 
        setTotalAlarm(false)
    };

    //메일 발송
    const onClickWebAndMail = (i) => {
        if(i === 0) {
            const users = array
                .filter(item => item.userId !== user.userId)
                .map(item => item.userId)

            for(let i = 0; i < users.length; i++) {
                const noti = {
                    projectId: newProjectId,
                    userId: users[i],
                    sender: user.lastName+user.firstName,
                    priority: 0,
                    noticeType: 'PAGE',
                    targetId: pageId,
                    body: newPageTitle
                  }

                api.post('/push-notifications', noti)
                .then(response => {
                    console.log('웹 & 메일 알림 전송: ', response.data.data)

                    setIsSendNoti(false);
                    setIsNoti(false);
                    setIsLook(false);
                    setActiveGroupIndex(null); 
                    setTotalAlarm(false)
                    setIsGroupDot(new Array(newData.length).fill(false)); 
                })
                .catch(error => {
                    console.error(error)
                })
            }
        } else {
            const noti = {
                projectId: newProjectId,
                userId: array[i].userId,
                sender: user.lastName+user.firstName,
                priority: 0,
                noticeType: 'PAGE',
                targetId: newPageId,
                body: newPageTitle
              }

            api.post('/push-notifications', noti)
            .then(response => {
                console.log('웹 & 메일 알림 전송: ', response.data.data)
    
                setIsSendNoti(false);
                setIsNoti(false);
                setIsLook(false);
                setActiveGroupIndex(null); 
                setIsGroupDot(new Array(newData.length).fill(false)); 
                setTotalAlarm(false)
            })
            .catch(error => {
                console.error(error)
            })
        }
    }

    const onClickWeb = (i) => {
        if(i === 0) {
            const users = array
            .filter(item => item.userId !== user.userId)
            .map(item => item.userId)

            for(let i = 0; i < users.length; i++) {
                const noti = {
                    projectId: newProjectId,
                    userId: users[i],
                    sender: user.lastName+user.firstName,
                    priority: 1,
                    noticeType: 'PAGE',
                    targetId: newPageId,
                    body: newPageTitle
                }

                api.post('/push-notifications', noti)
                .then(response => {
                    console.log('웹 & 메일 알림 전송: ', response.data.data)

                    setIsSendNoti(false);
                    setIsNoti(false);
                    setIsLook(false);
                    setActiveGroupIndex(null);
                    setTotalAlarm(false)
                    setIsGroupDot(new Array(newData.length).fill(false)); 
                })
                .catch(error => {
                    console.error(error)
                })
            }
        } else {
            const noti = {
                projectId: newProjectId,
                userId: array[i].userId,
                sender: user.lastName+user.firstName,
                priority: 1,
                noticeType: 'PAGE',
                targetId: newPageId,
                body: newPageTitle
              }
    
            api.post('/push-notifications', noti)
            .then(response => {
                console.log('웹 알림 전송: ', response.data.data)
                setIsSendNoti(false);
                setIsNoti(false);
                setIsLook(false);
                setActiveGroupIndex(null); 
                setIsGroupDot(new Array(newData.length).fill(false)); 
                setTotalAlarm(false)
            })
            .catch(error => {
                console.error(error)
            })
        }
    }

    const[totalAlarm, setTotalAlarm] = useState(false)
    const onClickTotalAlarm = () => {
        setTotalAlarm(totalAlarm => !totalAlarm)
        setIsGroupDot(new Array(newData.length).fill(false))
    }

    //나간 시간 계산
    const detailDate = (a) => {
		const milliSeconds = new Date() - a;
		const seconds = milliSeconds / 1000;
		if (seconds < 60) return `방금 전`;
		const minutes = seconds / 60;
		if (minutes < 60) return `${Math.floor(minutes)} minutes ago`;
		const hours = minutes / 60;
		if (hours < 24) return `${Math.floor(hours)} hours ago`;
		const days = hours / 24;
		if (days < 7) return `${Math.floor(days)} days ago`;
		const weeks = days / 7;
		if (weeks < 5) return `${Math.floor(weeks)} weeks ago`;
		const months = days / 30;
		if (months < 12) return `${Math.floor(months)} months ago`;
		const years = days / 365;
		return `${Math.floor(years)} years ago`;
	}
    const nowDate = (lastChecked) => {

        const dateString = lastChecked;
        const dateParts = dateString.split(' ');

        const year = `20${dateParts[0].substring(0, 2)}`;
        const month = dateParts[0].substring(3, 5);
        const day = dateParts[0].substring(6, 8);

        const time = dateParts[2];
        const hoursMinutes = time.split(':');
        let hours = hoursMinutes[0];
        const minutes = hoursMinutes[1];

        if (dateParts[1] === 'PM' && hours > 12) {
            hours = hours - 12;
        }

        const formattedDateString = `${year}-${month}-${day} ${hours}:${minutes}:00 ${dateParts[1]}`;
        return detailDate(new Date(formattedDateString))
    } 

    return(
        <div >
            <div>
                <div><img className="lookImg" src={ look } onClick={ onClickLook } /></div>
                <div><span className="lookTxt">{newData.length}명</span></div>
            </div>
            <div className={isLook ? "look-show-menu" : "look-hide-menu"}>
                <div className="look-showSec-box">
                    <img className="look-secImg" src={ totalUser }/>
                        <span className="look-name-txt">전체 알림 보내기</span>
                        <img className="look-arrow-img" src={ arrowtriangle } onClick={onClickTotalAlarm} />
                        <div
                            className={totalAlarm ? "lookNoti-show-menu" : "lookNoti-hide-menu"}
                        >
                            <div className="send-noti-box">
                                <div className="look-bell-box1">
                                    <div className="look-bell-box"><span className="look-bell-txt">Web & Mail</span></div>
                                    <div><img className="look-bell-img" src={ bellRed } onClick={() => onClickWebAndMail(0)}/></div>
                                </div>
                                <div className="look-bell-box2">
                                    <div className="look-bell-box"><span className="look-bell-txt">Web</span></div>
                                    <div className="bell-img-box"><img className="look-bell-img" src={ bellGreen } onClick={() => onClickWeb(0)}/></div>
                                </div>
                            </div>
                        </div>
                    </div>
            {array.map((noti, i) => (
                <div className="look-showSec-box" key={i} >
                    {noti.isChecked ? <>{noti.isEntering || noti.userId == user.userId ? <img className="look-now-img" src={ lookNow }/> : <img className="look-secImg" src={ lookOk }/>}</> : <img className="look-nonImg" src={ lookNo }/>}
                    <span className="look-name-txt">{noti.userName}</span>
                    
                    {noti.isChecked ? (
                    <span className="look-sec-txt">{noti.isEntering || noti.userId == user.userId? "Now" : nowDate(noti.lastChecked)}</span>
                    ) : <span className="look-sec-txt"></span>}
                    
                    {user.userId === noti.userId ? 
                    <></> 
                    : 
                    <div>
                        <img className="look-arrow-img" src={ arrowtriangle } onClick={() => onClickArrow(i)} />
                        <div
                            className={isGroupDot[i] ? "lookOne-show-menu" : "lookNoti-hide-menu"}
                        >
                            <div className="send-noti-box">
                                <div className="look-bell-box1">
                                    <div className="look-bell-box"><span className="look-bell-txt">Web & Mail</span></div>
                                    <div><img className="look-bell-img" src={ bellRed } onClick={() => onClickWebAndMail(i)}/></div>
                                </div>
                                <div className="look-bell-box2">
                                    <div className="look-bell-box"><span className="look-bell-txt">Web</span></div>
                                    <div className="bell-img-box"><img className="look-bell-img" src={ bellGreen } onClick={() => onClickWeb(i)}/></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    }

                </div>
            ))}
            </div>
        </div>

    );
}

export default PageNoti