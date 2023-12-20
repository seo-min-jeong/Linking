import React, { useState, useEffect } from "react"
import Modal from 'react-modal'
import './Group.css'
import api from "../../utils/api"

function AddDoc(props) {
    const { onClose, onButtonClick, groupId, order } = props
    const user = JSON.parse(localStorage.getItem('user'))
    const [title, setTitle] = useState('')

    const onClickClose = () => {
        onClose(false)
    }

    const [inputCount, setInputCount] = useState(0)

    const handleChange = event => {
        setInputCount(event.target.value.length)
        setPage({
            ...page,
            [event.target.name]: event.target.value
        })
        if (event.target.name === 'title') {
            setTitle(event.target.value)
          } 
    }

    const [selectedBox, setSelectedBox] = useState("BLANK")

    const handleBoxClick = (event) => {
        const { id } = event.currentTarget
        setSelectedBox(id)
    }

    const [page, setPage] = useState({
        groupId: groupId,
        title: '',
        order: order,
        template: selectedBox
    })

    useEffect(() => {
        setPage(prevPage => ({
          ...prevPage,
          template: selectedBox
        }))
      }, [selectedBox])

    const [newPage, setNewPage] = useState({
        pageId: 0,
        groupId: groupId,
        title: '',
        blockResList: [],
        pageCheckResList: [],
        annotNotiCnt: 0
    })

    const handleClick = event => {
        event.preventDefault()
        api.post('/pages', page, {
            headers: {
                'userId': user.userId,
            }
        })
          .then(response => {
            const updatedNewPage = {
                pageId: response.data.data.pageId,
                groupId: response.data.data.groupId,
                title: response.data.data.title,
                template: response.data.data.template,
                annotNotiCnt: response.data.data.annotNotiCnt
            }
            setNewPage(updatedNewPage)
            onButtonClick('documents', updatedNewPage)
            onClose(false)
          })
          .catch(error => {
            console.error(error)
          })
      }

    return(
        <Modal
        isOpen={true}
        className="doc-modal"
        >
            <div className="doc-modalBox">
                <div className="group-closeBox"><span className="group-closeTxt" onClick={ onClickClose }>x</span></div>
                <div className="group-txt-box">
                    <span className="group-txt">문서 템플릿 선택 후 제목을 입력해 주세요.</span>
                </div>
                <div className="page-template-box">
                    <div className="page-blank-box">
                        <div 
                            className="template-blank-box"
                            id="BLANK"
                            onClick={handleBoxClick}
                            style={{ border: selectedBox === "BLANK" ? "2px solid red" : "" }}
                            >
                            <span className="template-txt">blank Page</span>
                        </div>
                        <span 
                        className="page-template-txt"
                        style={{ color: selectedBox === "BLANK" ? "red" : "" }}
                        >
                            Blank Page
                        </span>
                    </div>
                    <div className="page-title-box">
                        <div 
                            className="template-title-box"
                            id="BLOCK"
                            onClick={handleBoxClick}
                            style={{ border: selectedBox === "BLOCK" ? "2px solid red" : "" }}
                        >
                            <span className="template-txt">Title Page</span>
                        </div>
                        <span 
                            className="page-template-txt"
                            style={{ color: selectedBox === "BLOCK" ? "red" : "" }}
                            >
                                Content Page
                            </span>
                    </div>
                </div>
                <div className='group-Input-box'>
                    <input 
                    className='doc-Input' 
                    type='text' 
                    name='title' 
                    value={title} 
                    onChange={handleChange} 
                    placeholder="Enter the page title"
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

export default AddDoc