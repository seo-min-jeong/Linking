import React, { useState, useRef, useEffect } from "react";
import Modal from 'react-modal';
import api from "../utils/api"
import './Block.css';
import arrowBelow from "../icon/arrowBelow.png"
import arrowUp from "../icon/arrowUp.png"

function BlockCloneModal(props) {
    const { onClose, isOpen, pageId, projectId, groupArr, title, onValueBlockChange, content } = props
    const user = JSON.parse(localStorage.getItem('user'))

    const onClickClose = () => {
        onClose(false)
    }

    //arrow
    const [expandedGroups, setExpandedGroups] = useState(Array(groupArr.length).fill(false));
    const onArrowClick = (groupIndex) => {
        const newExpandedGroups = [...expandedGroups];
        newExpandedGroups[groupIndex] = !newExpandedGroups[groupIndex];
        setExpandedGroups(newExpandedGroups);
    }

    //체크박스
    const [isChecked, setIsChecked] = useState(false);

    const [selectedUser, setSelectedUser] = useState({})
    const [diffPageId, setDiffPageId] = useState()
    const handleCheckboxChange = (event) => {
        const pageId = parseInt(event.target.value)
        setSelectedUser({
            pageId: pageId
        });
        setDiffPageId(pageId)
        setIsChecked(false);
    }

    //복제 버튼
    const onClickReproduction = () => {
        //현재페이지
        if(pageId === diffPageId) {
            const clone = {
                cloneType: 'THIS',
                title: title,
                content: content,
                pageId: pageId
            }
            api.post('/blocks/clone', clone, {
                headers: {
                    'userId': user.userId
                }
            })
            .then(response => {
                onValueBlockChange(response.data.data, title)
                onClose(false)
            })
            .catch(error => {
              console.error(error)
            })
            //다른페이지
        } else {
            const clone = {
                cloneType: 'OTHER',
                title: title,
                content: content,
                pageId: diffPageId
            }
            api.post('/blocks/clone', clone, {
                headers: {
                    'userId': user.userId
                }
            })
            .then(response => {
                onClose(false)
            })
            .catch(error => {
              console.error(error)
            })
        }
    }

    return (
        <Modal
        isOpen={true}
        className="block-modal"
        >
            <div className="doc-modalBox">
                <div className="group-closeBox"><span className="group-closeTxt" onClick={ onClickClose }>x</span></div>
                <div className="clone-txt-box">
                    <span className="group-txt">블록을 복제할 문서를 선택해 주세요.</span>
                </div>
                {/* <div className="clone-now-box">
                    <input 
                    type="checkbox" 
                    className="title-clone-chk" 
                    checked={isChecked}
                    onChange={handleCheckboxClick}
                    /><span className="title-clone-txt">현재 블록 페이지</span>
                </div> */}
                
                <div>
                    {/* <div className="title-clone1-box">
                        <span className="title-clone1-txt">다른 블록 페이지</span>
                    </div> */}
                    <div className="pages-clone-box">
                    {groupArr.map((group, i) => (
                        <div 
                        key={i}
                        className="page-clone-box"
                        >
                        <span className="page-clone-txt">{group.name}</span>
                            {group.pageResList.length > 0 && (
                                <button className="side-arrowBtn" onClick={() => onArrowClick(i)}>
                                    {expandedGroups[i] ?
                                    <div className="side-arrowBox"><img className="arrowBelow-img" src={arrowBelow} /></div>
                                        : <div className="side-arrowBox"><img className="arrowUp-img" src={arrowUp} /></div>}
                                    </button>
                                )}
                                <div className={expandedGroups[i] ? "side-doc-openBox" : "side-doc-hideBox"}>
                                    <div className="side-doc-box">
                                        {group.pageResList.map((doc, j) => (
                                            <div key={j}>
                                                {doc.template === "BLOCK" ? 
                                                <div className="title-clone-chkbox">
                                                    <input
                                                    type="checkbox"
                                                    className="title-clone-chk"
                                                    value={doc.pageId}
                                                    checked={selectedUser.pageId === doc.pageId}
                                                    onClick={handleCheckboxChange}
                                                    />
                                                    <span className="title-clone-txt">{doc.title}</span>
                                                </div>
                                                : 
                                                <></>
                                                }
                                            </div>
                                            ))
                                        }
                                            </div>
                                        </div>
                                    </div>
                    ))}
                    </div>
                </div>
                <div className="groupBtn-box"><button className="groupBtn" onClick={onClickReproduction}>복제</button></div>
            </div>
        </Modal>
    )
}

export default BlockCloneModal