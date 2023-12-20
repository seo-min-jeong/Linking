import React, { useState } from "react"

import lookOk from "./icon/look-ok.png"
import lookNo from "./icon/look-no.png"
import arrow from "./icon/doc-arrow.png"

function DocumentChk() {

    const [isLook, setIsLook] = useState(false)
    const [isNoti, setIsNoti] = useState(false)

    const onClickNoti = () => {
        setIsNoti(isNoti => !isNoti)
    }

    return(
        <div className={isLook ? "lookOpen-menu" : "lookHide-menu"}>
            <div className="lookOpen-sec-menu1">
                <div className="look-sec-menu">
                    <div className="look-secImg-box"><img className="look-secImg" src={ lookOk }/></div>
                    <div className="look-secTxt-box"><span>서민정</span></div>
                    <div className="look-secTxt-box"><span>3/13</span></div>
                    <div className="look-secTxt-box"><span>11:00pm</span></div>
               </div>
               <div className="look-sec-menu">
                    <div className="look-secImg-box"><img className="look-secImg" src={ lookOk }/></div>
                    <div className="look-secTxt-box"><span>서민정</span></div>
                    <div className="look-secTxt-box"><span>3/13</span></div>
                    <div className="look-secTxt-box"><span>11:00pm</span></div>
               </div>
               <div className="look-sec-menu">
                    <div className="look-secImg-box"><img className="look-secImg" src={ lookNo }/></div>
                    <div className="look-secTxt-box"><span>서민정</span></div>
                    <div className="look-secTxt-box"><span>3/13</span></div>
                    <div className="look-secTxt-box"><span>11:00pm</span></div>
               </div>
               <div className="look-sec-menu">
                    <div className="look-secImg-box"><img className="look-secImg" src={ lookNo }/></div>
                    <div className="look-secTxt-box"><span>서민정</span></div>
                    <div className="look-secTxt-box"><span>3/13</span></div>
                    <div className="look-secTxt-box"><span>11:00pm</span></div>
               </div>
            </div>
           <div className="look-arrow-box">
                <div className="lookOpen-sec-menu2">
                    <div className="arrowImg-box"><img className="arrowImg" src={ arrow } onClick={ onClickNoti }/></div>
                    <div className="arrowImg-box"><img className="arrowImg" src={ arrow } onClick={ onClickNoti }/></div>
                    <div className="arrowImg-box"><img className="arrowImg" src={ arrow } onClick={ onClickNoti }/></div>
                    <div className="arrowImg-box"><img className="arrowImg" src={ arrow } onClick={ onClickNoti }/></div>
                </div>
                <div className={isNoti ? "arrowOpen-box" : "arrowHide-box"}>
                    <span>알림 보내기</span>
                </div>
            </div>
        </div>
    )
}

export default DocumentChk