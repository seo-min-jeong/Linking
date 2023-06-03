import React, { useState, useRef, useEffect } from "react";
import Modal from 'react-modal';
import './Group.css';


function GroupDeletePopup(props) {
    const { onClose, onButtonClick, index } = props;
    const [inputValue, setInputValue] = useState('');

    function handleClick() {
        onClose(false);
        onButtonClick(index)
    }

    const onClickClose = () => {
        onClose(false);
    }

    return(
        <Modal
        isOpen={true} 
        className="group-delete-modal"
        >
            <div className="group-modalBox">
                <div className="group-closeBox"><span className="group-closeTxt" onClick={ onClickClose }>x</span></div>
                <div className="group-deleteTxt"><span className="group-txt">해당 그룹을 삭제하시겠습니까?</span></div>
                <div className="group-deleteBtn-box">
                    <button className="group-deleteBtn1" onClick={handleClick}>삭제</button>
                    <button className="group-deleteBtn2" onClick={onClickClose}>취소</button>
                </div>
            </div>
        </Modal>
    );
}

export default GroupDeletePopup;