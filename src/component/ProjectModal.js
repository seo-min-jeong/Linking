import React, { useState, useRef, useEffect } from "react";
import Modal from 'react-modal';
import './ProjectModal.css';
import crown from "../icon/crown.png"

function ProjectModal(props) {
    const { isOpen, onClose, data, ownerId } = props;

    return(
        <Modal isOpen={isOpen} onRequestClose={onClose} className="modal">
            <div className="project-box" >
                <div className="close-box"><span className="closeTxt" onClick={ onClose }>x</span></div>
                <div className="project-name-box">
                    <div className="project-name-sec"><span className="project-name">프로젝트명</span></div>
                        <div className="project-name-sec">
                            <span className="project-name-txt">{data.projectName}</span>
                        </div>
                    <div className="date-box">
                        <div className="date-sec1-box">
                            <span>시작일</span>
                            <label className="datePicker-label">
                                <span className="project-date">{data.beginDate.toString()}</span>
                            </label>
                        </div>
                        <div className="date-sec1-box">
                            <span>마감일</span>
                            <label className="datePicker-label">
                                <span className="project-date">{data.dueDate.toString()}</span>
                            </label>
                        </div>
                    </div>
                    <div className="project-select-box">
                        <div className="team-sec"><span className="team-name">팀원</span></div>
                        <div id="teamOne-scroll" className="team-people-sec">
                            {data.partList.map((part, index) => (
                            <div className="team-total-box">
                                <div className="team-txt-sec" key={index}>
                                    <span className="team-name-txt">{part.lastName}{part.firstName}</span>
                                    {ownerId === part.userId ? 
                                        <div className="crown-box"> 
                                            <img src={crown} className="crown-img"/> 
                                        </div>
                                        : <></>
                                    }
                                </div>
                                <div className="team-txt-sec" key={index}>
                                    <span className="team-email-txt">{part.email}</span>
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
  }

  export default ProjectModal;