import React, { useState } from "react";
import './Content.css';
import api from '../utils/api'

import AddContent from "./AddContent"

import plus from "../icon/plus.png"
import arrowUpDown from "../icon/arrowUpDown.png"

function Content(props) {
    const{onAddTitle, dataArray, setDataArray, pageId } = props
    const user = JSON.parse(localStorage.getItem('user'))
    
    //plus 버튼
    const [isAddContent, setIsAddContent] = useState(false)
    const onClickContentPlus = () => {
        setIsAddContent(isAddContent => !isAddContent);
    }

    const[title, setTitle] = useState('')
    const handleInputProject = (inputName, newValue) => {
        if (inputName === 'title') {
            setTitle(newValue)
          } 
          onAddTitle('title', newValue)
    }

    //블록이동
    const[isDragGroup, setIsDragGroup] = useState(false)
    const [ grab, setGrab ] = React.useState(null)
    
    const _onDragOver = e => {
        e.preventDefault()
    }
    const _onDragStart = e => {
        setGrab(e.target)
        e.target.classList.add("grabbing")
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData("text/html", e.target)
    }
    const _onDragEnd = e => {
        e.target.classList.remove("grabbing")
        e.dataTransfer.dropEffect = "move"
    }
    const _onDrop = e => {
        let grabPosition = Number(grab.dataset.position)
        let targetPosition = Number(e.target.dataset.position)
      
        let _list = [ ...dataArray ]
        _list[grabPosition] = _list.splice(targetPosition, 1, _list[grabPosition])[0]

        setDataArray(_list)
        }

        const newGroupArr = dataArray?.map(block => block.blockId)

        const sendBlock = {
            pageId: pageId,
            blockIds: newGroupArr
        }

        const onClickDropDragNow = () => {
            setIsDragGroup(isDragGroup => !isDragGroup)
        }
        const onClickGroupDrag = () => {
            console.log(newGroupArr)
            api.put('/blocks/order', sendBlock, {
                headers: {
                    'userId': user.userId
                }
            })
            .then(response => {
                console.log('블록 순서변경 성공', response.data.data)
            })
            .catch(error => {
                console.error(error)
            })
            setIsDragGroup(false)
        }

    //
    const renderDivs = () => {
        console.log(dataArray)
        const divs = []

            for (let i = 0; i < dataArray.length; i++) {
                if(dataArray[i].blockId != -1) {
                    const blockTitle = dataArray[i].title || "untitled"

                divs.push(
                    <div className="side-content-sideBox" key={i} >
                        <div 
                        className="side-content-secBox"
                        data-position={i}
                        onDragOver={_onDragOver}
                        onDragStart={_onDragStart}
                        onDragEnd={_onDragEnd}
                        onDrop={_onDrop}
                
                        draggable
                        style={{
                        backgroundColor: dataArray[i].backgroundColor,
                        color: dataArray[i].color,
                        fontSize: "bold"
                        }}
                        >
                            <div className="side-index-box"><span>{i+1}.</span></div>
                            <span>{blockTitle === null || blockTitle === '' ? "untitled" : blockTitle}</span>
                        </div>
                    </div>
                )
            }
        }
        return divs
    }

    return(
        <div className="content-open-box">
            <div className="title-box">
                <span className="title-txt">목 차</span>
            </div>

            <div className="side-div-box">
                {renderDivs()}
            </div>
            <div className="content-plus-box">
                <div>
                    <img className="content-plus-img" src={ plus } onClick={ onClickContentPlus }/>
                </div>
                <div>
                    <span className="content-plus-txt">목차 추가</span>
                </div>
            </div>
            {isDragGroup ? 
            <div className="arrowUpDown-box">
                <span className="arrowUpDown-txt" onClick={onClickGroupDrag}>Done</span>
            </div>
            : 
            <div className="arrowUpDown-box">
                <img className="arrowUpDown-img" src={ arrowUpDown } onClick={onClickDropDragNow} />
            </div>
            }

            {isAddContent ? <AddContent onClose={setIsAddContent} onButtonClick={handleInputProject} /> : <></>}
        </div>

    )
}

export default Content