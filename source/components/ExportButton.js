import React from 'react'
import downloadIcon from '../images/download.svg'

export default function ExportButton(props) {
  return (
    <a className='export' onClick={props.onClick}>
      {props.text}
      <img src={downloadIcon} className='download-icon' alt='Download' />
    </a>
  )
}
ExportButton.propTypes = {
  text: React.PropTypes.string,
  onClick: React.PropTypes.func,
}
ExportButton.defaultProps = {
  text: '',
  onClick: () => {},
}
