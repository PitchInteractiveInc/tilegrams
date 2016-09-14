import React from 'react'

export default function ExportButton(props) {
  return (
    <fieldset>
      <a className='export' onClick={props.onClick}>
        {props.text}
      </a>
    </fieldset>
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
