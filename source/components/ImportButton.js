import React from 'react'

export default class ImportButton extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      displayFileInput: false,
    }

    this._displayFileInput = this._displayFileInput.bind(this)
    this._onChange = this._onChange.bind(this)
  }

  _displayFileInput() {
    this.setState({displayFileInput: true})
  }

  _onChange(event) {
    const file = event.target.files[0]
    const reader = new FileReader()
    reader.onload = readEvent => {
      const topoJson = JSON.parse(readEvent.target.result)
      this.props.onLoad(file.name, topoJson)
    }
    reader.readAsText(file)
  }

  render() {
    let fileInput
    if (this.state.displayFileInput) {
      fileInput = (
        <input
          className='import'
          type='file'
          onChange={this._onChange}
        />
      )
    }
    return (
      <fieldset>
        <a className='import' onClick={this._displayFileInput}>
          Import TopoJSON
        </a>
        {fileInput}
      </fieldset>
    )
  }
}
ImportButton.propTypes = {
  onLoad: React.PropTypes.func,
}
ImportButton.defaultProps = {
  onLoad: () => {},
}
