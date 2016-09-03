import React, {PropTypes} from 'react'

const tools = ['arrow', 'marquee']
export default class ToolSelector extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      tool: 'arrow',
    }
    this._selectTool = this._selectTool.bind(this)
  }

  _selectTool(tool) {
    return () => {
      this.setState({tool})
      this.props.onSelect(tool)
    }
  }

  render() {
    const toolsButtons = tools.map((tool) => {
      const activeTool = tool === this.state.tool
      return (
        <span
          onClick={this._selectTool(tool)}
          key={tool}
          className={activeTool ? 'active' : ''}
        >
          {tool}
        </span>
      )
    })
    return (
      <div id='toolSelector'>
        {toolsButtons}
      </div>
    )
  }
}

ToolSelector.propTypes = {
  onSelect: PropTypes.func,
}
