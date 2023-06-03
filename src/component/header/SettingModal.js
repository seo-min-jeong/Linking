import React, { useState, useEffect } from "react";
import Modal from 'react-modal';
import api from '../../utils/api'
import { useCookies } from 'react-cookie'

import './SettingModal.css';

function SettingModal(props) {
  const { onClose, settingData } = props;
  const user = JSON.parse(localStorage.getItem('user'))
  const [cookies] = useCookies(['session'])

  const [isWebNotiChecked, setWebNotiChecked] = useState(false);
  const [isMailNotiChecked, setMailNotiChecked] = useState(false);

  useEffect(() => {
    if(settingData) {
      setWebNotiChecked(settingData.allowedWebAppPush)
      setMailNotiChecked(settingData.allowedMail)
    }
}, [settingData]);

  const handleWebNotiToggle = () => {
    setWebNotiChecked(!isWebNotiChecked);
  }

  const handleMailNotiToggle = () => {
    setMailNotiChecked(!isMailNotiChecked);
  }

  const onClickClose = () => {
    onClose(false);
  }

  const handleClick = () => {
    //푸시알림 설정 보내기
    const pushSetting = {
      userId: user.userId,
      allowedWebAppPush: isWebNotiChecked,
      allowedMail: isMailNotiChecked
    }

    api.put('/push-settings/web', pushSetting)
        .then(response => {
          console.log('푸시알림 설정 완료: ', response.data.data)
        })
        .catch(error => {
            console.error(error)
        })
    
        onClose(false);
  };

    return(
      <Modal 
      isOpen={true} 
      className="group-modal"
      >
          <div className="setting-modalBox">
            <div className="setting-closeBox">
              <span className="group-closeTxt" onClick={onClickClose}>x</span>
            </div>
            <div className="setting-txt-box">
              <span className="setting-txt">알림 환경 설정</span>
            </div>
            <div className="toggle-box">
              <span className="toggle-txt">메일 알림</span>
              <div className={`toggle-switch ${isMailNotiChecked ? 'checked' : ''}`} onClick={handleMailNotiToggle}>
                <div className={`slider ${isMailNotiChecked ? 'checked' : ''}`} />
              </div>
            </div>
            <div className="toggle-box">
              <span className="toggle-txt">웹 알림&nbsp;&nbsp;&nbsp;</span>
              <div className={`toggle-switch ${isWebNotiChecked ? 'checked' : ''}`} onClick={handleWebNotiToggle}>
                <div className={`slider ${isWebNotiChecked ? 'checked' : ''}`} />
              </div>
            </div>
            <div className="groupBtn-box"><button className="groupBtn" onClick={handleClick}>저장</button></div> 
          </div>
      </Modal>
  
    );
  }

  export default SettingModal;