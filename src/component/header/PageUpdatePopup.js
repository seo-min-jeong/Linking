import React, { useState } from "react";
import Modal from 'react-modal';
import './PagePopup.css';

function PageUpdatePopup(props) {
    const { onClose, onButtonClick, name } = props;
    const [title, setTitle] = useState('');

    const handleClick = event => {
        onButtonClick('title', title)
        onClose(false);
    }

    const onClickClose = () => {
        onClose(false);
    }

    const [inputCount, setInputCount] = useState(0)

    const handleChange = event => {
        setInputCount(event.target.value.length);
        if (event.target.name === 'title') {
            setTitle(event.target.value)
          } 
    };

    return(
        <Modal
        isOpen={true} 
        className="group-modal"
        >
            <div className="group-modalBox">
                <div className="group-closeBox"><span className="group-closeTxt" onClick={ onClickClose }>x</span></div>
                <div className="group-txt-box"><span className="group-txt">수정할 페이지 제목을 입력해 주세요.</span></div>
                <div className='group-Input-box'>
                    <input 
                    className='group-Input' 
                    type='text' 
                    name='title' 
                    value={title} 
                    onChange={handleChange} 
                    placeholder={name}
                    maxLength={50}
                    />
                    <p className="input-count-txt">
                        <span>{inputCount}</span>
                        <span>&nbsp;/ 50</span>
                    </p>
                </div>
                <div className="groupBtn-box"><button className="groupBtn" onClick={handleClick}>저장</button></div>
            </div>
        </Modal>
    )
}

export default PageUpdatePopup