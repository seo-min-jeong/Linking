import React, { useState, useRef, useEffect } from "react";
import Modal from 'react-modal';
import './Content.css';


function AnnotationUpdatePopup(props) {
    const { onClose, onButtonClick } = props;
    const [annoContent, setAnnoContent] = useState('');

    const handleChange = (event) => {
        setAnnoContent(event.target.value);
    }
    function handleClick() {
        onButtonClick('content', annoContent);
        onClose(false);
    }

    const onClickClose = () => {
        onClose(false);
    }

    return(
        <Modal
        isOpen={true}
        className="content-modal"
        >
            <div className="content-modalBox">
                <div className="content-closeBox"><span className="content-closeTxt" onClick={ onClickClose }>x</span></div>
                <div><span className="content-txt">수정할 주석 내용을 입력해주세요.</span></div>
                <div className='content-Input-box'><input className='content-Input' type='text' name='annoContent' value={annoContent} onChange={handleChange} /></div>
                <div className="contentBtn-box"><button className="contentBtn" onClick={handleClick}>저장</button></div>
            </div>
        </Modal>
    );
}

export default AnnotationUpdatePopup;