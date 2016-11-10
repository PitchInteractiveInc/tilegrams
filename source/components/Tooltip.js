import React from 'react'

const xPosDefault = 320 // should match sidebar-width in css/variables.scss

export default function Tooltip(props) {
  const display = props.hidden ? 'none' : 'block'

  return (
    <div
      className='tooltip'
      style={{
        display,
        position: 'fixed',
        top: `${props.yPos}px`,
        left: `${props.xPos}px`,
      }}
    >
      {props.text}
    </div>
  )
}
Tooltip.propTypes = {
  text: React.PropTypes.string,
  hidden: React.PropTypes.bool,
  xPos: React.PropTypes.number,
  yPos: React.PropTypes.number,
}
Tooltip.defaultProps = {
  text: '',
  hidden: true,
  xPos: xPosDefault,
  yPos: 0,
}
