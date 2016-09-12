import React from 'react'

const warningText = `You have made changes to your map.
 Editing the resolution or reimporting will overwrite those changes.`

export default function EditWarningModal(props) {
  return (
    <div
      className='modal-edit-warning'
      onClick={(event) => event.stopPropagation()}
    >
      <div className='warning-text'>
        {warningText}
        <br />
        <br />
        Do you wish to continue?
        <br />
        <a
          style={{float: 'left'}}
          onClick={props.startOver}
        >
          Yes
        </a>
        <a
          style={{float: 'right'}}
          onClick={props.resumeEditing}
        >
          Resume Editing
        </a>
        <div style={{clear: 'both'}} />
      </div>
    </div>
  )
}

EditWarningModal.propTypes = {
  startOver: React.PropTypes.func,
  resumeEditing: React.PropTypes.func,
}

EditWarningModal.defaultProps = {
  startOver: () => {},
  resumeEditing: () => {},
}
