import React from 'react'

export default function ExportButton(props) {
  return (
    <fieldset>
      <a className='export' onClick={props.onClick}>
        Export TopoJSON
      </a>
    </fieldset>
  )
}
ExportButton.propTypes = {
  onClick: React.PropTypes.func,
}
ExportButton.defaultProps = {
  onClick: () => {},
}
