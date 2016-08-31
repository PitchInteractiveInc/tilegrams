import React from 'react'

export default class ExportButton extends React.Component {
  render() {
    return (
      <fieldset>
        <a className="export" onClick={() => this.props.onClick()}>
          Export TopoJSON
        </a>
      </fieldset>
    )
  }
}
ExportButton.propTypes = {
  onClick: React.PropTypes.func,
}
ExportButton.defaultProps = {
  onClick: () => {},
}
